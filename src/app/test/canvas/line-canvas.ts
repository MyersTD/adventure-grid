import { ICanvas } from './canvas-interface';
import SaveManager from '../save-manager/save-manager';
import { DrawingCell, LineCell } from '../save-manager/cell';

export class LineCanvas implements ICanvas{
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
        this._contextEle.lineWidth = 3;
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
                this._drawingOn = false;
                this.EndDraw(e);
                break;
            case 2:
                this._panning = false;
                break;
            case 3:
                this._drawingOn = false;
                this.EndErase(e);
        }
    }

    Draw (e) {
        let posData = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        let x = posData.cornerX, y = posData.cornerY, sqSz = this._squareSize;
        this.DrawLine(posData.edge, x, y, sqSz);
        this._saveManager.Save(new LineCell(posData.edge, posData.cornerX, posData.cornerY, this._currentColor))
    }

    DrawLine(edge, x, y, sqSz) {
        switch (edge) {
            case 'top':
                this._contextEle.moveTo(x, y);
                this._contextEle.lineTo(x + sqSz, y);
                break;
            case 'bottom':
                this._contextEle.moveTo(x, y + sqSz);
                this._contextEle.lineTo(x + sqSz, y + sqSz);
                break;
            case 'left':
                this._contextEle.moveTo(x, y);
                this._contextEle.lineTo(x, y + sqSz);
                break;
            case 'right':
                this._contextEle.moveTo(x + sqSz, y);
                this._contextEle.moveTo(x + sqSz, y + sqSz);
                break;
        }
        this._contextEle.stroke();
    }

    EndDraw(e) {
        this._contextEle.closePath();
    }

    Erase(e) {
        let posData = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        this._saveManager.Erase(this._saveManager.Key(posData.cornerX, posData.cornerY));
    }

    EndErase(e) {
        
    }
    
    EraseCell(key) {
        this._contextEle.clearRect(key.x, key.y, this._squareSize, this._squareSize);
    }
    DrawCell(cell) { 
        this.DrawLine(cell._edge, cell._x, cell._y, this._squareSize);
        this._contextEle.closePath();
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