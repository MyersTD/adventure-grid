import { ICanvas } from '../interfaces/canvas-i';

export class GridCanvas implements ICanvas {
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
    _sync: any;
    GetSquarePos: (e, sqSz, w, h) => any;

    constructor(id, sqSz, w, h, getSqFunc) {
        this._canvasEle = document.createElement("canvas");
        this._canvasEle.width = w;
        this._canvasEle.height = h;
        this._contextEle = this._canvasEle.getContext('2d');
        this._id = id;
        this._squareSize = sqSz;
        this._width = w;
        this._height = h;
        this.SetupListeners();
        this.SetupGrid();
        this.GetSquarePos = getSqFunc;
    }

    private SetupGrid() {
        let nX = Math.floor(this._width / this._squareSize) - 2 // number of squares on X
        let nY = Math.floor(this._height / this._squareSize) - 2 // number of squares on Y
        let pX = this._width - nX * this._squareSize // padding X
        let pY = this._height - nY * this._squareSize // padding Y
        let pL = Math.ceil(pX / 2) - 0.5 // padding left
        let pT = Math.ceil(pY / 2) - 0.5 // padding top
        let pR = this._width - nX * this._squareSize - pL // padding right
        let pB = this._height - nY * this._squareSize - pT // padding bottom


        for (var x = pL; x <= this._width - pR; x += this._squareSize) {
            this._contextEle.moveTo(x, pT)
            this._contextEle.lineTo(x, this._height - pB)
        }

        for (var y = pT; y <= this._height - pB; y += this._squareSize) {
            this._contextEle.moveTo(pL, y)
            this._contextEle.lineTo(this._width - pR, y)
        }

        this._contextEle.strokeStyle = "#ddd"
        this._contextEle.stroke()
    }

    private SetupListeners() {
        this._canvasEle.addEventListener('mousedown', e => {
            
        })
        this._canvasEle.addEventListener('mousemove', e => {
            
        })
        this._canvasEle.addEventListener('mouseup', e => {
            
        })
    }

    MouseDown(e) {
    }

    MouseMove(e) {
    }

    MouseUp(e) { }

    Clear() { }
}