import * as ws from 'ws';

export type Msg = {
    type: string
    body: any
}

export type MsgType =
    "info" |
    "error" |
    "connection" |
    "disconnected" |
    "makeMove" |
    "newMove" |
    "opponent"


export function sendMsg(socket: ws.WebSocket | WebSocket, type: MsgType, body: any) {
    const jsonMsg = {
        type: type,
        body: body
    }
    socket.send(JSON.stringify(jsonMsg));
}

export type Connection = {
    selfID: number
    opponentID: number
    char: 'X' | 'O'
}
