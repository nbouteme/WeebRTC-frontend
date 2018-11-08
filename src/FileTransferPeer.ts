import { peerConnectionConfig } from "@/config";
import { sendMessage, info, CommandType } from "@/SignallingServer";

class FileTransferPeer {
    channels = new Map<string, RTCDataChannelWrapper>();
    channelsres = new Map<string, (v: RTCDataChannelWrapper) => void>();
    peer: RTCPeerConnection;
    connectres?: () => void;

    constructor(config: RTCConfiguration) {
        this.peer = new RTCPeerConnection(config);

        this.peer.ondatachannel = e => {
            console.log('got channel');
            let dc = e.channel;
            let wr = new RTCDataChannelWrapper(dc);
            this.channels.set(dc.label, wr);
            let res = this.channelsres.get(dc.label);
            res && res(wr);
        };

        this.peer.onicecandidate = async e => {
            console.log(e.candidate);
            if (!info.token)
                throw new Error('token not set');
            await sendMessage(JSON.stringify([CommandType.Broadcast, info.token, JSON.stringify(e.candidate)]));
            if (!e.candidate) {
                // await closeConnection();
                this.connectres && this.connectres();
                this.connectres = undefined;
            }
        };
    }

    connect() {
        return new Promise(res => {
            if (this.peer.connectionState === 'connected')
                return res();
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
    readres?: (v: MessageEvent) => void;
    openfun?: () => void;

    constructor(dc: RTCDataChannel) {
        this.dc = dc;
        dc.onmessage = m => {
            if (!this.readres)
                this.mq.push(m);
            else {
                this.readres(m);
                this.readres = undefined;
            }
        };

        dc.onopen = () => {
            this.openfun && this.openfun();
        };
    }

    open() {
        return new Promise<void>(res => {
            if (this.dc.readyState === 'open')
                return res();
            this.openfun = res;
        });
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

    rawRead() {
        return new Promise<MessageEvent>(res => {
            if (this.mq.length > 0)
                return res(this.mq.splice(0, 1)[0]);
            this.readres = res;
        });
    }

    async read<T>(transform: typeof jsonparse = jsonparse) {
        return transform<T>(await this.rawRead());
    }
}
