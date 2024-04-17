import { sendMsg, Msg } from './utils/jsonmsg.js';
import { Grid } from './grid/grid.js';
import { Info } from 'server/ws-server.js';

const grid = new Grid(15, 15);

grid.colorKey = {
    "burned": "#555555"
}

grid.drawLine(4, 3, 12, 9);

grid.drawBoard();


grid.addMouseEvent("mousedown", (e, x, y) => {
    grid.ctx.fillStyle = "#000000";
    grid.ctx.font = grid.squareSize.toString() + "px Monospace";

    let offset = grid.squareSize + grid.spacing;

    grid.ctx.fillText("X", x * offset + 4 * grid.spacing, (y + 1) * offset - 2 * grid.spacing);
})


const websocket = new WebSocket(`ws://${window.location.host}`);

// websocket.onopen = (event) => {
//     websocket.send(jsonmsg("join", ""));
// };

let opponent: Info;

websocket.onmessage = (event) => {
    const msg = JSON.parse(event.data) as Msg;
    switch (msg.type) {
        case "error":
            throw new Error(msg.body);
        case "connection":
            opponent = JSON.parse(msg.body) as Info;
            console.log("Hello", opponent.id);
            break;
        case "disconnected":
            console.log("Goodbye");
            break;
        default:
            console.log(msg.body);
            break;
    }
}



