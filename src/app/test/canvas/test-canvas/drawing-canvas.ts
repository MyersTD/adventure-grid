import { ICanvas } from '../interfaces/canvas-interface';
import SaveManager from '../../save-manager/save-manager';
import { DrawingCell } from '../../save-manager/cell';

export class DrawingCanvas implements ICanvas{
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
    _drawingOn: boolean;
    _panning: boolean;
    _lastDragX: number;
    _currentColor: any;
    _saveManager: SaveManager;
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
        this._saveManager = new SaveManager(this);
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
                this._drawingOn = true;
                this.Draw(e);
                break;
            case 2:
                this._panning = true;
                this._lastDragX = e.clientX - this._canvasEle.offsetLeft;
                break;
            case 3:
                this._drawingOn = true;
                this.Erase(e);
                break;
        }
    }

    MouseMove(e) {
        switch(e.which) {
            case 1: 
                this._drawingOn = true;
                this.Draw(e);
                break;
            case 2: 
                break;
            case 3:
                this._drawingOn = true;
                this.Erase(e);
        }
    }

    MouseUp(e) {
        switch(e.which) {
            case 1:
                this.EndDraw(e);
                break;
            case 2:
                this._panning = false;
                break;
            case 3:
                this.EndErase(e);
        }
    }

    Draw(e) {
        this._contextEle.fillStyle = this._currentColor;
        let posData = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        this._contextEle.fillRect(posData.cornerX, posData.cornerY, this._squareSize, this._squareSize);
        let cell = new DrawingCell(posData.cornerX, posData.cornerY, this._currentColor);
        this._saveManager.Save(cell);
    }

    EndDraw(e) {
        this._drawingOn = false;
    }

    Erase(e) {
        let posData = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        this._contextEle.clearRect(posData.cornerX, posData.cornerY - 1, this._squareSize + 1, this._squareSize + 1);
        this._saveManager.Erase({x: posData.cornerX, y: posData.cornerY})
    }

    EndErase(e) {
        this._drawingOn = false;
    }

    DrawCell(cell) {
        this._contextEle.fillStyle = cell._color;
        this._contextEle.fillRect(cell._x, cell._y, this._squareSize, this._squareSize);
    }

    EraseCell(key) {
        this._contextEle.clearRect(key.x, key.y - 1, this._squareSize + 1 , this._squareSize + 1);
    }

    Pan(e, lastDragX) {
        let styleLeft = (e.clientX - lastDragX) + 'px';
        let styleRight = (e.clientX + lastDragX) + 'px';

        this._canvasEle.style.left = styleLeft;
        this._canvasEle.style.right = styleRight;
    }

    Clear() {
        this._contextEle.clearRect(0, 0, this._width, this._height);
    }
}