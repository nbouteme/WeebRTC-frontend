export const messages: { [k in string]: any } = {
  fr: {
    head: 'Salut !',
    sub: 'Partagez avec WebRTC',
    waiting: 'En attente de connexion du pair...',
    sendingmeta: 'Pair connecté, envoi des informations de transfert',
    waitingack: "Pair connecté, attente d'acceptation...",
    fileselect: 'Attente de séléction de fichier...',
    filerefused: 'Le fichier a été refusé.',
    transfering: 'Transfert en cours...',
    error: 'Une erreur est survenue. Veuillez rafraîchir la page et recommencer',
    copy: 'Copier',

    key: 'Clé',
    token: 'Jeton',
    select: 'Choisir un fichier',
    drop: 'Lâche le~',

    connectedLobby: 'Connecté à la salle, en attente du pair...',
    connectedPeer: "Connecté au pair, en attente d'un fichier...",

    accept: 'Accepter ?',
    waitingtransfer: 'En attente...',

    longtoken: 'Long jetons',
    enableaes: 'Activer Encryption AES',
    randkey: 'Donne moi une clé',

    gentoken: 'Récupération du jeton...',
    offline: 'Cette application nécessite une connexion Internet.'
  },
  en: {
    none: '',
    head: 'Hi there!',
    sub: 'Share files through WebRTC',
    waiting: 'Waiting for peer connection...',
    sendingmeta: 'Peer connected, sending file metadata...',
    waitingack: "Peer connected, waiting for response...",
    fileselect: 'Waiting for file selection...',
    filerefused: 'The peer refused the file.',
    transfering: 'Transfering file...',
    error: 'An error occured. Please refresh the page and start again.',

    copy: 'Copy',
    key: 'Key',
    token: 'Token',
    select: 'Select a file',
    drop: 'Drop it~',

    connectedLobby: 'Connected to lobby, waiting for peer...',
    connectedPeer: 'Connected to peer, waiting for file...',

    accept: 'Accept?',
    waitingtransfer: 'Waiting...',

    longtoken: 'Use long tokens',
    enableaes: 'Add AES Encryption',
    randkey: 'Give me a random key',

    gentoken: 'Generating token...',
    offline: 'This application requires online connectivity to use.'
  },
  ja: {
    head: 'どうも',
    sub: 'ニンジャスレイヤーです',
    filerefused: 'だが断る!',
    error: 'YEEART'
  }
};

messages["en-US"] = messages.en;
