import { ICanvas } from '../interfaces/canvas-i';

export class BackgroundCanvas implements ICanvas {
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
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
        this.SetupBackground();
        this.GetSquarePos = getSqFunc;
    }

    private SetupBackground() {
        this._contextEle.fillStyle = "beige";
        this._contextEle.fillRect(0, 0, this._width, this._height);
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