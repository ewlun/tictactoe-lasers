import { sendMsg, Msg, MsgType } from './utils/jsonmsg.js';
import { Grid } from './grid/grid.js';

const grid = new Grid(15, 15);

grid.colorKey = {
    "burned": "#555555",
    "border": "#000000",
    "empty": "#FFFFFF"
}

// grid.drawLine(4, 3, 12, 9);

grid.drawBoard();


grid.addMouseEvent("mousedown", (e, x, y) => {
    // grid.ctx.fillStyle = "#000000";
    // grid.ctx.font = grid.squareSize.toString() + "px Monospace";

    // let offset = grid.squareSize + grid.spacing;

    // grid.ctx.fillText("X", x * offset + 4 * grid.spacing, (y + 1) * offset - 2 * grid.spacing);
    sendMsg(websocket, "makeMove", { move: [x, y, "X"] });
})


const websocket = new WebSocket(`ws://${window.location.host}`);

let opponent: number | undefined = 0;
let self: number = 0;

export type Connection = {
    selfID: number,
    opponentID: number
}

websocket.onmessage = (event) => {
    const msg = JSON.parse(event.data) as Msg;
    switch (msg.type as MsgType) {
        case "error":
            throw new Error(msg.body);
        case "connection":
            let response = msg.body as Connection;
            opponent = response.opponentID;
            console.log("Hello", opponent);
            break;
        case "disconnected":
            console.log("Goodbye");
            opponent = undefined;
            break;
        case "newMove":
            let move = msg.body as (number | string)[]; // [4,6,"X",5,6,"burned"]
            for (let i = 0; i < move.length / 3; i++) {
                let x = move[i * 3 + 0] as number;
                let y = move[i * 3 + 1] as number;
                grid.board[x][y] = move[i * 3 + 2] as string;
            }
            grid.drawBoard();
            break;
        default:
            console.log(msg.body);
            break;
    }
}



