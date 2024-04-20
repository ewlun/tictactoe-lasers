import http from 'http'
import WebSocket from 'ws';
import { WebSocketServer } from "ws";
import { app } from './http-server.js';
import { MsgType, sendMsg } from '../client/utils/jsonmsg.js';
import { Lobby, Player, Move } from './player-lobby.js'

const port = 3000;
const ip = '127.0.0.1';

const server = http.createServer();

const wss = new WebSocketServer({ server: server });

let sockets: WebSocket[] = [];

let playerMap: Map<Number, Player> = new Map();
let lobbies: Lobby[] = [];
let waiting: Player[] = [];

wss.on('connection', (socket, request) => {
    sockets.push(socket);
    let self = new Player(socket, "john");

    playerMap.set(self.id, self)

    if (waiting.length === 0) {
        waiting.push(self);
        sendMsg(self.socket, "info", "Waiting...");
    }
    else {
        // opponent = waiting[0];
        let opponent = waiting[0]
        let lobby = new Lobby(opponent.id, self.id);

        self.lobby = lobby;
        self.opponentID = opponent.id;
        opponent.lobby = lobby;
        opponent.opponentID = self.id;

        lobbies.push(lobby);
        waiting.pop();
        sendMsg(self.socket, "connection", { selfID: self.id, opponentID: self.opponentID });
        sendMsg(opponent.socket, "connection", { selfID: opponent.id, opponentID: opponent.opponentID });
    }

    socket.on("message", event => {
        const msg = JSON.parse(event.toString());
        switch (msg.type as MsgType) {
            case "makeMove":
                if (self.opponentID === undefined) {
                    sendMsg(self.socket, "error", "No opponent");
                    break;
                }
                let move = msg.body as Move;
                let opponent = playerMap.get(self.opponentID!);
                sendMsg(self.socket, "newMove", move.move);
                sendMsg(opponent!.socket, "newMove", move.move);
                break;

            default:
                sendMsg(socket, "error", `Unknown message: ${msg.type}`);
                break;
        }
    });

    socket.on('close', () => {
        sockets.splice(sockets.indexOf(self.socket), 1);
        if (waiting.indexOf(self) !== -1)
            waiting.pop(); // Borde inte finnas mer än 1 som väntar men idk

        if (self.lobby !== undefined) { // Om socket finns i en lobby
            self.lobby.playerIds.splice(self.lobby.playerIds.indexOf(self.id), 1);
            let opponent = playerMap.get(self.opponentID!)!
            sendMsg(opponent.socket, "disconnected", "");
            waiting.push(opponent);
            lobbies.splice(lobbies.indexOf(self.lobby), 1);
        }
    });
})


server.on('request', app);
server.listen(port, ip, () => { console.log(`Serving on http://${ip}:${port}`) });