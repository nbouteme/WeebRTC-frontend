export let peerConnectionConfig: RTCConfiguration = {
    'iceServers': [{
        urls: 'stun:stun.stunprotocol.org:3478'
    }, {
        urls: 'stun:stun.l.google.com:19302'
    }, {
        urls: 'stun:kuriyama.moe:3478'
    }, {
        urls: 'turn:kuriyama.moe:3478',
        username: 'test',
        credential: 'test'
    }]
};

export let appState: { offline: boolean } = { offline: false };

if (BUILD === 'development')
    peerConnectionConfig.iceServers!.unshift({ urls: 'stun:localhost:3478' });

export let websockurl = `ws${location.protocol == 'https:' ? 's' : ''}://${location.hostname}`;
