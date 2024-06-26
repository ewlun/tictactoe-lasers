import WebSocket from 'ws';
import { WebSocketServer } from "ws";
import { server } from './http-server.js';
import { Connection, MsgType, sendMsg } from '../client/utils/jsonmsg.js';
import { Lobby, Player, Move } from './player-lobby.js'

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
        let opponent = waiting[0]
        let lobby = new Lobby(opponent.id, self.id);
        lobby.turn = opponent.id; // Gör slumpmässig

        self.lobby = lobby;
        self.opponentID = opponent.id;
        opponent.lobby = lobby;
        opponent.opponentID = self.id;

        lobbies.push(lobby);
        waiting.pop();

        let selfCon: Connection = { selfID: self.id, opponentID: self.opponentID, char: "O" }
        let oppCon: Connection = { selfID: opponent.id, opponentID: opponent.opponentID, char: "X" }

        sendMsg(self.socket, "connection", selfCon);
        sendMsg(opponent.socket, "connection", oppCon);
    }

    socket.on("message", event => {
        const msg = JSON.parse(event.toString());
        switch (msg.type as MsgType) {
            case "makeMove":
                if (self.lobby === undefined) {
                    sendMsg(self.socket, "error", "No opponent");
                    break;
                }
                let move = msg.body as Move;
                let opponent = playerMap.get(self.opponentID!);

                if (move.id !== self.lobby.turn) {
                    sendMsg(self.socket, "info", "Not your turn");
                    break;
                }

                sendMsg(self.socket, "newMove", move.move);
                sendMsg(opponent!.socket, "newMove", move.move);
                self.lobby.turn = opponent!.id
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