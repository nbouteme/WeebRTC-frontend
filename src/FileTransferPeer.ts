import { peerConnectionConfig } from "@/config";
import { sendMessage, info, CommandType, readMessage } from "@/SignallingServer";

let nextFrame = () => new Promise<void>(r => requestAnimationFrame(e => r()));

class FileTransferPeer {
    channels = new Map<string, RTCDataChannelWrapper>();
    channelsres = new Map<string, (v: RTCDataChannelWrapper) => void>();
    peer: RTCPeerConnection;
    connectres?: () => void;
    connected = false;

    constructor(config: RTCConfiguration) {
        this.peer = new RTCPeerConnection(config);

        this.peer.ondatachannel = e => {
            let dc = e.channel;
            let wr = new RTCDataChannelWrapper(dc);
            this.channels.set(dc.label, wr);
            let res = this.channelsres.get(dc.label);
            res && res(wr);
        };

        this.peer.oniceconnectionstatechange = e => {
            console.error(e);
            if (this.peer.iceConnectionState == 'disconnected')
                [...this.channels.values()].map(c => c.close());
        };

        this.peer.onicecandidate = async e => {
            if (!info.token)
                throw new Error('token not set');
            await sendMessage(JSON.stringify([CommandType.Broadcast, info.token, JSON.stringify(e.candidate)]));
            if (!e.candidate) {
                // await closeConnection();
                this.connected = true;
                this.connectres && this.connectres();
                this.connectres = undefined;
            }
        };
    }

    connect() {
        return new Promise<void>(res => {
            if (this.connected)
                res();
            else
                this.connectres = res;
        });
    }

    createChannel(name: string, dict?: RTCDataChannelInit) {
        let chan = new RTCDataChannelWrapper(this.peer.createDataChannel(name, dict));
        this.channels.set(name, chan);
        return chan;
    }

    async setSDP(sdp: RTCSessionDescriptionInit) {
        if (!info.token)
            throw new Error('Token not set');
        await this.peer.setLocalDescription(sdp);
        await sendMessage(JSON.stringify([CommandType.Broadcast, info.token, JSON.stringify(this.peer.localDescription)]));
    };

    waitDataChannel(name: string) {
        return new Promise<RTCDataChannelWrapper>(res => {
            if (this.channels.has(name))
                return res(this.channels.get(name)!);
            this.channelsres.set(name, res);
        });
    }

    /* On ne peut pas hériter directement de RTCPeerConnection, donc boilerplate */

    setRemoteDescription(desc: RTCSessionDescriptionInit) {
        return this.peer.setRemoteDescription(desc);
    }

    setLocalDescription(desc: RTCSessionDescriptionInit) {
        return this.peer.setLocalDescription(desc);
    }

    createOffer(opts?: RTCOfferOptions) {
        return this.peer.createOffer(opts);
    }

    createAnswer(opts?: RTCOfferOptions) {
        return this.peer.createAnswer(opts);
    }

    addIceCandidate(cand: RTCIceCandidate) {
        return this.peer.addIceCandidate(cand);
    }
}

export let Peer = new FileTransferPeer(peerConnectionConfig);

function jsonparse<T>(v: MessageEvent) {
    return JSON.parse(v.data) as T;
}

class RTCDataChannelWrapper {
    dc: RTCDataChannel;
    mq: MessageEvent[] = [];
    readres?: [(v: MessageEvent) => void, (r?: any) => void];
    openres?: [() => void, (r?: any) => void];

    constructor(dc: RTCDataChannel) {
        this.dc = dc;
        dc.onmessage = m => {
            if (!this.readres)
                this.mq.push(m);
            else {
                this.readres[0](m);
                this.readres = undefined;
            }
        };

        dc.onerror = dc.onclose = e => {
            console.error(e);
            this.readres && this.readres[1](e);
            this.openres && this.openres[1](e);
            this.readres = undefined;
            this.openres = undefined;
        };

        dc.onopen = () => {
            this.openres && this.openres[0]();
            this.openres = undefined;
        };
    }

    open() {
        return new Promise<void>((res, rej) => {
            switch (this.dc.readyState) {
                case 'open':
                    return res();
                case 'connecting':
                    this.openres = [res, rej];
                    break;
                default:
                    rej(this.dc.readyState);
            }
        });
    }

    close() {
        console.log('closing dc...');
        this.dc.close();

        // Chrom* ne lance pas l'évènement même si la connexion est perdue.
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=1676
        this.dc.onclose && this.dc.onclose(new Event('close'));
    }

    // Typescript supporte mal l'inférence de type sur les fonctions
    // surchargées avec des paramêtres de type union, donc le type inféré est 
    // incorrect, donc obligé de cast vers any pour éviter une série de test
    // inutiles destinés à faire taire le compilateur
    // https://github.com/Microsoft/TypeScript/issues/14107
    // Retiré blob de l'union car l'envoi de blob n'est pas supporté dans chrome.
    async send(data: string | ArrayBuffer | ArrayBufferView) {
        await this.open();
        this.dc.send(data as any);
    }

    /*
        Dans le cas d'échanges de gros fichiers, des packets risquent
        de s'accumuler dans le tampon de sortie.
        À partir de 16Mo, sous Chrome, la datachannel est immediatement fermée:
        https://bugs.chromium.org/p/webrtc/issues/detail?id=2866#c34
    */
    async flush() {
        // onbufferedamountlow n'est jamais émit sur chrome
        // https://bugs.chromium.org/p/chromium/issues/detail?id=582085
        // Donc on ne peut pas compter dessus.
        if (this.dc.bufferedAmount > 0x800000)
            while (this.dc.bufferedAmount > 0x4000)
                await nextFrame();
    }

    rawRead() {
        return new Promise<MessageEvent>((res, rej) => {
            if (this.mq.length > 0)
                return res(this.mq.splice(0, 1)[0]);
            this.readres = [res, rej];
        });
    }

    async read<T>(transform = jsonparse) {
        return transform<T>(await this.rawRead());
    }
}
