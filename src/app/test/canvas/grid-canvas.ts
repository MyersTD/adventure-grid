import { ICanvas } from './canvas-interface';

export class GridCanvas implements ICanvas{
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
    _panning: boolean;
    _lastDragX: number;
    _session: number;
    GetSquarePos: (e, sqSz, w, h) => any;

    constructor (id, w, h, sqSz, getSqFunc, session) {
        this._session = session;
        this._id = id;
        this._height = h;
        this._width = w;
        this._squareSize = sqSz;
        this._canvasEle = document.createElement("canvas");
        this._canvasEle.width = w;
        this._canvasEle.height = h;
        this._contextEle = this._canvasEle.getContext('2d');
        this.GetSquarePos = getSqFunc;
        this.SetupListeners();
        this.SetupGrid();
    }

    private SetupGrid() {
       // Draw Grid

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
            this.MouseDown(e)
        })
        this._canvasEle.addEventListener('mousemove', e => {
            this.MouseMove(e)
        })
        this._canvasEle.addEventListener('mouseup', e => {
            this.MouseUp(e)
        })
    }

    MouseDown(e) {
        switch(e.which) {
            case 1: 
                console.log(e);
                break;
            case 2:
                break;
            case 3:
        }
    }

    MouseMove(e) {
        switch(e.which) {
            case 1: 
                break;
            case 2: 
                break;
            case 3:
        }
    }

    MouseUp(e) {
        switch(e.which) {
            case 1:
                break;
            case 2:
                break;
            case 3:
        }
    }

    Draw (e) {
       
    }

    EndDraw(e) {
        
    }

    Erase(e) {

    }

    EndErase(e) {
        
    }
    
    DrawCell(cell) { 

    }
    EraseCell(key) {
       
    }
    Pan(e, lastDragX) {
        let styleLeft = (e.clientX - lastDragX) + 'px';
        let styleRight = (e.clientX + lastDragX) + 'px';

        this._canvasEle.style.left = styleLeft;
        this._canvasEle.style.right = styleRight;
    }

    Clear() {
        
    }
}