import http from 'http';
import { WebSocketServer } from "ws";
import { app } from './http-server.js';
import { sendMsg } from '../client/utils/jsonmsg.js';
const port = 3000;
const ip = '127.0.0.1';
const server = http.createServer();
const wss = new WebSocketServer({ server: server });
let sockets = [];
let socketInfo = new Map();
let lobbies = [];
let waiting = [];
wss.on('connection', socket => {
    sockets.push(socket);
    socketInfo.set(socket, { id: Date.now() });
    if (waiting.length === 0) {
        waiting.push(socket);
        sendMsg(socket, "info", "Waiting...");
    }
    else {
        let opponent = waiting[0];
        lobbies.push([socket, opponent]);
        waiting.splice(waiting.indexOf(opponent), 1);
        sendMsg(socket, "connection", JSON.stringify(socketInfo.get(opponent)));
        sendMsg(opponent, "connection", JSON.stringify(socketInfo.get(socket)));
    }
    socket.on("message", event => {
        const msg = JSON.parse(event.toString());
        switch (msg.type) {
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
            sendMsg(socketLobby[0], "disconnected", "");
            waiting.push(socketLobby[0]);
            lobbies.splice(lobbies.indexOf(socketLobby), 1);
        }
    });
});
server.on('request', app);
server.listen(port, ip, () => { console.log(`Serving on http://${ip}:${port}`); });
