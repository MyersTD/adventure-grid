import { ICanvas } from './canvas-interface';
import SaveManager from '../save-manager/save-manager';

export class BackgroundCanvas implements ICanvas{
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
    _panning: boolean;
    _lastDragX: number;
    GetSquarePos: (e, sqSz, w, h) => any;

    constructor (id, w, h, sqSz, getSqFunc) {
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
       this._contextEle.fillStyle = "beige";
       this._contextEle.fillRect(0, 0, this._width, this._height);
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
        console.log(e);
        switch(e.which) {
            case 1: 
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

    Pan(e, lastDragX) {
        let styleLeft = (e.clientX - lastDragX) + 'px';
        let styleRight = (e.clientX + lastDragX) + 'px';

        this._canvasEle.style.left = styleLeft;
        this._canvasEle.style.right = styleRight;
    }

    Clear() {
        
    }
}