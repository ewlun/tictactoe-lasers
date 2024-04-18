import { sendMsg, Msg, MsgType } from './utils/jsonmsg.js';
import { Grid } from './grid/grid.js';
import { PlayerInfo } from 'server/ws-server.js';

const grid = new Grid(15, 15);

grid.colorKey = {
    "burned": "#555555",
    "border": "#000000"
}

// grid.drawLine(4, 3, 12, 9);

grid.drawBoard();


grid.addMouseEvent("mousedown", (e, x, y) => {
    // grid.ctx.fillStyle = "#000000";
    // grid.ctx.font = grid.squareSize.toString() + "px Monospace";

    // let offset = grid.squareSize + grid.spacing;

    // grid.ctx.fillText("X", x * offset + 4 * grid.spacing, (y + 1) * offset - 2 * grid.spacing);
    sendMsg(websocket, "makeMove", [x, y, "burned"]);
})


const websocket = new WebSocket(`ws://${window.location.host}`);

// websocket.onopen = (event) => {
//     websocket.send(jsonmsg("join", ""));
// };

let opponent: PlayerInfo | undefined = undefined;

websocket.onmessage = (event) => {
    const msg = JSON.parse(event.data) as Msg;
    switch (msg.type as MsgType) {
        case "error":
            throw new Error(msg.body);
        case "connection":
            opponent = JSON.parse(msg.body) as PlayerInfo;
            sendMsg(websocket, "opponent", opponent);
            console.log("Hello", opponent.id);
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
                grid.board[x][y] = move[i * 3 + 2];
            }
            grid.drawBoard();
            break;
        default:
            console.log(msg.body);
            break;
    }
}



