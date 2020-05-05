import { ICanvas } from '../interfaces/canvas-i';
import { ICell, Key } from '../../cells/interface/cell-interface';
import { SquareCell } from '../../cells/square-cell';
import { sizeof } from '../../../sizeof.compressed';

export class SquareCanvas implements ICanvas {
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
    _cellMap: Map<string, ICell>
    _isDrawing: boolean;
    _currentColor: any;
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
        this._cellMap = new Map<string, ICell>();
        this.GetSquarePos = getSqFunc;
        this.SetupListeners();
    }

    private SetupListeners() {
        this._canvasEle.addEventListener('mousedown', e => {
            this.MouseDown(e);
        })
        this._canvasEle.addEventListener('mousemove', e => {
            this.MouseMove(e);
        })
        this._canvasEle.addEventListener('mouseup', e => {
            this.MouseUp(e);
        })
    }

    MouseDown(e) {
        switch(e.which) {
            case 1: 
                this._isDrawing = true;
                this.Draw(e);
                break;
            case 2:
                break;
            case 3:
                this._isDrawing = true;
                this.Erase(e);
        }
    }

    MouseMove(e) {
        switch(e.which) {
            case 1: 
                if (this._isDrawing) this.Draw(e);
                break;
            case 2: 
                break;
            case 3:
                if (this._isDrawing) this.Erase(e);
        }
    }

    MouseUp(e) {
        switch(e.which) {
            case 1:
                this._isDrawing = false;
                break;
            case 2:
                break;
            case 3:
                this._isDrawing = false;
        }
    }

    Subscribe(data) {
        if (data.cell != null) {
            let cell = new SquareCell(data.cell._x, data.cell._y, data.cell._color);
            let key = new Key(cell._x, cell._y);
            if (data.mode == 'add') {
                this._cellMap.set(key.string(), cell);
                cell.Draw(this);
            } else  if (data.mode == 'remove'){
                if (this._cellMap.has(key.string())) {
                    this._cellMap.delete(key.string())
                }
                cell.Erase(this);
            } 
        }
        if (data.mode == 'clear') {
            this._contextEle.clearRect(0, 0, this._width, this._height);
            this._cellMap.clear();
        }
    }

    LoadHistory(data) {
        if (data.history != null) {
            let newMap = new Map(JSON.parse(data.history))
            newMap.forEach((cell:any) => {
                let newCell = new SquareCell(cell._x, cell._y, cell._color);
                let key = new Key(cell._x, cell._y);
                this._cellMap.set(key.string(), newCell);
                newCell.Draw(this);
            })
        } 
    }

    Publish(cell, mode) {
        this._sync.Publish(this._id, mode, cell);
    }

    Draw(e) {
        let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        let key = new Key(pos.cornerX, pos.cornerY);
        if (!this._cellMap.has(key.string())) {
            let cell = new SquareCell(pos.cornerX, pos.cornerY, this._currentColor);
            this._cellMap.set(key.string(), cell);
            cell.Draw(this);
            this.Publish(cell, 'add');
        }
    }

    Erase(e) {
        let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        let key = new Key(pos.cornerX, pos.cornerY);
        if (this._cellMap.has(key.string())) {
            let cell = this._cellMap.get(key.string())
            this.Publish(cell, 'remove');
            this._cellMap.delete(key.string());
            this._contextEle.clearRect(pos.cornerX + .5, pos.cornerY + .5, this._squareSize, this._squareSize);
        }
    }

    Clear() {
        this._contextEle.clearRect(0, 0, this._width, this._height);
        this._cellMap.clear();
        this.Publish(null, 'clear')
    }
}