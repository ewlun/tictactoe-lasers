import WebSocket from 'ws';

export class Player {
    id: number;
    opponentID: number | undefined;
    socket: WebSocket;
    lobby: Lobby | undefined;
    username: string;

    constructor(socket: WebSocket, username: string) {
        this.socket = socket;
        this.id = Date.now();
        this.opponentID = undefined;
        this.username = username;
        this.lobby = undefined;
    }
}

export class Lobby {
    id: number;
    playerIds: number[];
    turn: number;
    static lobbyCount = 0;

    constructor(player1: number, player2: number) {
        this.id = Lobby.lobbyCount++;
        this.playerIds = [player1, player2];
        this.turn = 0;
    }
}

export type Move = {
    id: number,
    move: (number | string)[]
}