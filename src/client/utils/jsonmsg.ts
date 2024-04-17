import * as ws from 'ws';

export type Msg = {
    type: string,
    body: any
}

export function sendMsg(socket: ws.WebSocket | WebSocket, type: string, body: any) {
    const jsonMsg = {
        type: type,
        body: body
    }
    socket.send(JSON.stringify(jsonMsg));
}