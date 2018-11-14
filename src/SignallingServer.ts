import { websockurl } from '@/config';

export let info: {
    token?: string
} = {};

let ws = new WebSocket(websockurl);
let queue: MessageEvent[] = [];
let solve: ((m: MessageEvent) => void) | null;
let opened: () => void;
ws.onopen = () => opened && opened();

ws.onmessage = m => {
    if (solve) {
        solve(m);
        solve = null;
    } else {
        queue.push(m);
    }
};

let _readMessage = () => new Promise<MessageEvent>((res, rej) => {
    if (queue.length > 0) {
        let m = queue.splice(0, 1)[0];
        res(m);
    } else
        solve = res;
});

function jsparsedata<T>(v: MessageEvent) {
    return JSON.parse(v.data) as T;
}

type TransformFunction<T> = (v: MessageEvent) => T;

export async function readMessage<T>(transform: TransformFunction<T> = jsparsedata) {
    await connectionOpened();
    return transform(await _readMessage());
};

export let connectionOpened = () => new Promise<void>((res, rej) => {
    if (ws.readyState === WebSocket.OPEN)
        return res();
    opened = res;
});

export let sendMessage = async(d: Parameters<WebSocket['send']>[0]) => {
    await connectionOpened();
    ws.send(d);
};

export let closeConnection = () => ws.close();

export enum CommandType {
    RequestToken,
    Join,
    Broadcast
}
