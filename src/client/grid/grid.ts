export class Grid {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    boardHeight: number;
    boardWidth: number;
    spacing: number;
    squareSize: number;
    colorKey: Record<number | string, string> | undefined;
    board: (number | string)[][];

    constructor(boardWidth: number, boardHeight: number, spacing = 3, squareSize = 40,) {
        this.canvas = document.body.appendChild(document.createElement("canvas"));

        this.ctx = this.canvas.getContext('2d')!;

        this.boardHeight = boardHeight;
        this.boardWidth = boardWidth;

        this.spacing = spacing;
        this.squareSize = squareSize;

        this.canvas.width = (squareSize + spacing) * boardWidth + spacing;
        this.canvas.height = (squareSize + spacing) * boardHeight + spacing;

        this.board = new Array(boardWidth);

        for (let i = 0; i < boardWidth; i++) {
            this.board[i] = new Array(boardHeight).fill(0);
        }

        this.canvas.addEventListener("contextmenu", e => { e.preventDefault() });

        this.colorKey = undefined;
    }

    drawBoard(): void {
        if (this.colorKey === undefined)
            this.colorKey = { "border": "#000000" };

        this.ctx.fillStyle = this.colorKey["border"];

        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.boardHeight; i++) {
            for (let j = 0; j < this.boardWidth; j++) {

                if (this.colorKey[this.board[j][i]] === undefined)
                    this.ctx.fillStyle = '#FFFFFF';
                else {
                    this.ctx.fillStyle = this.colorKey[this.board[j][i]];
                }

                this.ctx.fillRect(j * (this.spacing + this.squareSize) + this.spacing,
                    i * (this.spacing + this.squareSize) + this.spacing,
                    this.squareSize, this.squareSize);
            }
        }
    }

    drawLine(x0: number, y0: number, x1: number, y1: number) {
        let dx = x1 - x0;
        let dy = y1 - y0;
        let D = 2 * dy - dx;
        let y = y0;

        for (let x = x0; x <= x1; x++) {
            this.board[x][y] = "burned"; // ändra om du vill återanvända
            if (D > 0) {
                y = y + 1
                D = D - 2 * dx
            }
            D = D + 2 * dy
        }
    }

    addMouseEvent(event: keyof HTMLElementEventMap, callback: (e: MouseEvent, x: number, y: number) => void): void {
        this.canvas.addEventListener(event, (e) => {
            let rect = (e.target as HTMLElement).getBoundingClientRect();
            let posx = (e as MouseEvent).clientX - rect.left;
            let posy = (e as MouseEvent).clientY - rect.top;
            let x = Math.floor(posx / this.canvas.width * this.boardWidth);
            let y = Math.floor(posy / this.canvas.height * this.boardHeight);
            callback(e as MouseEvent, x, y);
        })
    }
};