let iv = new Uint8Array([112, 170, 231, 137, 62, 41, 21, 216, 180, 114, 195, 56, 74, 50, 2, 190]);

export let sizestr = (n: number) => {
    const units = ["B", "KB", "MB", "GB", /* ISHYGDDT */ "TB", "PB", "EB", "ZB", "YB"];
    const e = ~~(Math.log(n) / Math.log(1024));
    const u = n / Math.pow(1024, e);
    return '' + ((~~(u * 100)) / 100) + units[e];
};

export async function stringToAESKey(keystr: string, purpose = ['decrypt', 'encrypt', 'verify', 'sign']) {
    let keybuf = new Uint8Array([...Array(keystr.length >> 1)].map((e, i) => parseInt(keystr.slice(i * 2, i * 2 + 2), 16)));
    return crypto.subtle.importKey(
        "raw", keybuf, {
            name: "AES-CBC",
            length: 256
        }, true, purpose);
}

export async function codecBuffer(buff: Uint8Array | ArrayBuffer, keystr: string, action: 'decrypt' | 'encrypt') {
    return crypto.subtle[action]({
        name: "AES-CBC",
        iv: iv
    }, await stringToAESKey(keystr, [action]), buff);
}

export async function hmac(buff: ArrayBuffer, keystr: string) {
    let keybuf = new Uint8Array([...Array(32)].map((e, i) => parseInt(keystr.slice(i * 2, i * 2 + 2), 16)));
    let key = await crypto.subtle.importKey(
        "raw",
        keybuf,
        {
            name: "HMAC",
            hash: { name: "SHA-256" }
        },
        true,
        ["sign"]
    );
    return crypto.subtle.sign("HMAC", key, buff);
}

export async function verify(buff: ArrayBuffer, keystr: string, hmac: ArrayBuffer) {
    let keybuf = new Uint8Array([...Array(32)].map((e, i) => parseInt(keystr.slice(i * 2, i * 2 + 2), 16)));
    let key = await crypto.subtle.importKey(
        "raw",
        keybuf,
        {
            name: "HMAC",
            hash: { name: "SHA-256" }
        },
        true,
        ["verify"]
    );
    return crypto.subtle.verify("HMAC", key, hmac, buff);
}

interface Measure {
    transfered: number;
    timestamp: number;
}

export class SpeedCounter {
    speed: number = 0;
    transfered: number = 0;
    private measures: Measure[] = [];
    private realSpeed: number = 0;
    private realTransfered: number = 0;
    private nextUpdate: number;
    private accuracy: number;

    constructor(accuracy: number) {
        this.nextUpdate = Date.now() + accuracy;
        this.accuracy = accuracy;
    }

    addMeasure(transfered: number) {
        let now = Date.now();
        this.measures.push({ transfered, timestamp: now });
        this.realSpeed += transfered;
        this.realTransfered += transfered;
        while (now - this.measures[0].timestamp > 1000)
            this.realSpeed -= this.measures.shift()!.transfered;
        if (now - this.nextUpdate > 0) {
            this.refresh();
        }
    }

    refresh() {
        this.speed = this.realSpeed;
        this.transfered = this.realTransfered;
        this.nextUpdate = Date.now() + this.accuracy;
    }
}

export function validEnc(k: string) {
    k = k.toLowerCase();
    return k.match(/^ *[0-9a-f]{64} *$/g);
};

export function saveBlobAsFile(name: string, data: Blob) {
    let url = URL.createObjectURL(data);
    let a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
};
