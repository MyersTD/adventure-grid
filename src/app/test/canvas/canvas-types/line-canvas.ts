import { ICanvas } from '../interfaces/canvas-i';
import { ICell, LineKey } from '../../cells/interface/cell-interface';
import { sizeof } from '../../../sizeof.compressed';
import { LineCell } from '../../cells/line-cell';
import { SquareCanvas } from './square-canvas';
import { LinePreviewCanvas } from './line-prev-canvas';

export class LineCanvas implements ICanvas {
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
    _cellMap: Map<string, ICell>
    _isDrawing: boolean;
    _currentColor: any;
    _lastDragX;
    _lastDragY;
    _anchoredCell;
    _previewCanvas;
    _sync;
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
                this.Anchor(e);
                break;
            case 2:
                break;
            case 3:
                this._isDrawing = true;
                this.Anchor(e);
        }
    }

    MouseMove(e) {
        switch(e.which) {
            case 1: 
                if (this._isDrawing) this.Drag(e);
                break;
            case 2: 
                break;
            case 3:
                if (this._isDrawing) this.Erase(e);
        }
    }

    MouseUp(e) {
        let key1 = new LineKey(this._anchoredCell._x, this._anchoredCell._y, this._anchoredCell._x2, this._anchoredCell._y2);
        let key2 = new LineKey(this._anchoredCell._x2, this._anchoredCell._y2, this._anchoredCell._x, this._anchoredCell._y);
        switch(e.which) {
            case 1:
                this._isDrawing = false;
                if (!this._cellMap.has(key1.string())) {
                    this._anchoredCell.Draw(this);
                    this._cellMap.set(key1.string(), this._anchoredCell);
                    this.Publish(this._anchoredCell, 'add');
                }
                this._previewCanvas._contextEle.clearRect(0, 0, this._previewCanvas._width, this._previewCanvas._height)
                break;
            case 2:
                break;
            case 3:
                this._isDrawing = false;
                if (this._cellMap.has(key1.string())) {
                    let cell = this._cellMap.get(key1.string())
                    this._cellMap.delete(key1.string());
                    this._anchoredCell.Erase(this);
                    this.Publish(cell, 'remove');
                } 
                if (this._cellMap.has(key2.string())) {
                    let cell = this._cellMap.get(key2.string())
                    this._cellMap.delete(key2.string());
                    this._anchoredCell.Erase(this);
                    this.Publish(cell, 'remove');
                }
                this._previewCanvas._contextEle.clearRect(0, 0, this._previewCanvas._width, this._previewCanvas._height)
        }
    }

    Drag(e) {
        let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        
        let corner = this.GetClosestCorner(pos);
        this._anchoredCell._x2 = corner.x;
        this._anchoredCell._y2 = corner.y;
        
        this._previewCanvas._contextEle.clearRect(0, 0, this._previewCanvas._width, this._previewCanvas._height)
        this._anchoredCell.Draw(this._previewCanvas);
    }

    Anchor(e) {
        let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        
        let corner = this.GetClosestCorner(pos);
        this._anchoredCell = new LineCell(corner.x, corner.y, this._currentColor);
    }

    Draw(e) {
        
    }

    Erase(e) {
        let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        let corner = this.GetClosestCorner(pos);
        this._anchoredCell._x2 = corner.x;
        this._anchoredCell._y2 = corner.y;
        
        this._previewCanvas._contextEle.clearRect(0, 0, this._previewCanvas._width, this._previewCanvas._height)
        this._anchoredCell.TempErase(this._previewCanvas);
    }

    Clear() {
        this._contextEle.clearRect(0, 0, this._width, this._height);
        this._cellMap.clear();
        this.Publish(null, 'clear');
    } 

    LoadHistory(data) {
        if (data.history != null) {
            let newMap = new Map(JSON.parse(data.history))
            newMap.forEach((cell:any) => { 
                let newCell = new LineCell(cell._x, cell._y, cell._color);
                newCell._x2 = cell._x2;
                newCell._y2 = cell._y2;
                let key = new LineKey(cell._x, cell._y, cell._x2, cell._y2);
                this._cellMap.set(key.string(), newCell);
                newCell.Draw(this);
            })
        }
    }

    Subscribe(data) {
        if (data.cell != null) {
            let cell = new LineCell(data.cell._x, data.cell._y, data.cell._color);
            cell._x2 = data.cell._x2;
            cell._y2 = data.cell._y2;
            let key = new LineKey(data.cell._x, data.cell._y, data.cell._x2, data.cell._y2);
            if (data.mode == 'add') {
                this._cellMap.set(key.string(), cell);
                cell.Draw(this); 
            } else if (data.mode == 'remove') {
                if (this._cellMap.has(key.string())) {
                    this._cellMap.delete(key.string());
                }
                cell.Erase(this);
            }
        } 
        if (data.mode == 'clear') {
            this._contextEle.clearRect(0, 0, this._width, this._height);
            this._cellMap.clear();
        }
    }

    Publish(cell, mode) {
       let stringedCell = cell;
        if (cell != null) {
           stringedCell = {_x: cell._x, _y: cell._y, _x2: cell._x2, _y2: cell._y2, _color: cell._color};
        } 
        this._sync.Publish(this._id, mode, stringedCell);
    }

    GetClosestCorner(pos) {
        if (pos.corner == 'top-left') return {x: pos.cornerX, y: pos.cornerY}
        else if (pos.corner == 'top-right') return {x: pos.cornerX + this._squareSize, y: pos.cornerY}
        else if (pos.corner == 'bottom-left') return {x: pos.cornerX, y: pos.cornerY + this._squareSize}
        else if (pos.corner == 'bottom-right') return {x: pos.cornerX + this._squareSize, y: pos.cornerY + this._squareSize}  
        else return {x: pos.centerX, y: pos.centerY}
    }
}