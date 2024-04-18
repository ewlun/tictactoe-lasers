import http from 'http'
import WebSocket from 'ws';
import { WebSocketServer } from "ws";
import { app } from './http-server.js';
import { MsgType, sendMsg } from '../client/utils/jsonmsg.js';

const port = 3000;
const ip = '127.0.0.1';

const server = http.createServer();

const wss = new WebSocketServer({ server: server });

export type PlayerInfo = {
    id: number,
    username?: string,
    player?: number
}

let sockets: WebSocket[] = [];
let socketInfo: Map<WebSocket, PlayerInfo> = new Map();

let lobbies: WebSocket[][] = [];
let waiting: WebSocket[] = [];

wss.on('connection', socket => {
    sockets.push(socket);
    socketInfo.set(socket, { id: Date.now() })

    let opponent: WebSocket | undefined = undefined;

    if (waiting.length === 0) {
        waiting.push(socket);
        sendMsg(socket, "info", "Waiting...");
    }
    else {
        opponent = waiting[0];
        lobbies.push([socket, opponent]);
        waiting.splice(waiting.indexOf(opponent), 1)
        sendMsg(socket, "connection", JSON.stringify(socketInfo.get(opponent)!));
        sendMsg(opponent, "connection", JSON.stringify(socketInfo.get(socket)!));
    }

    socket.on("message", event => {
        const msg = JSON.parse(event.toString());
        switch (msg.type as MsgType) {
            case "opponent":
                let opponentInfo = msg.body as PlayerInfo;
                opponent = [...socketInfo].find(([key, val]) => val.id == opponentInfo.id)?.[0];
                break;

            case "makeMove":
                if (lobbies.find(s => s.indexOf(socket) !== -1) === undefined) {
                    sendMsg(socket, "error", "No opponent");
                    break;
                }
                sendMsg(socket, "newMove", msg.body);
                sendMsg(opponent!, "newMove", msg.body);
                break;

            default:
                sendMsg(socket, "error", `Unknown message: ${msg.type}`);
                break;
        }
    });

    socket.on('close', () => {
        sockets.splice(sockets.indexOf(socket), 1);
        if (waiting.indexOf(socket) !== -1)
            waiting.splice(waiting.indexOf(socket), 1);

        let socketLobby = lobbies.find(s => s.indexOf(socket) !== -1);
        if (socketLobby !== undefined) { // Om socket finns i en lobby
            socketLobby.splice(socketLobby.indexOf(socket), 1);
            sendMsg(opponent!, "disconnected", "");
            waiting.push(opponent!);
            lobbies.splice(lobbies.indexOf(socketLobby), 1);
        }
    });
})


server.on('request', app);
server.listen(port, ip, () => { console.log(`Serving on http://${ip}:${port}`) });