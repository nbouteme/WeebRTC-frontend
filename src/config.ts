export let peerConnectionConfig = {
    'iceServers': [{
        urls: 'stun:stun.stunprotocol.org:3478'
    }, {
        urls: 'stun:stun.l.google.com:19302'
    }]
};

export let websockurl = `wss://${location.hostname}`;
