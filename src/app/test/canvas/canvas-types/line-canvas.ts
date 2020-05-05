import { ICanvas } from '../interfaces/canvas-i';
import { ICell, LineKey } from '../../cells/interface/cell-interface';
import { sizeof } from '../../../sizeof.compressed';
import { LineCell } from '../../cells/line-cell';
import { SquareCanvas } from './square-canvas';

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
                console.log('delete', this._cellMap)
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

    Draw(e) {
        let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        if (pos.edge) {
            let key = new LineKey(pos.cornerX, pos.cornerY, pos.edge);
            let cell = new LineCell(pos.cornerX, pos.cornerY, pos.edge, this._currentColor);
            this._cellMap.set(key.string(), cell);
            cell.Draw(this);
        }
    }

    Erase(e) {
        let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        if (pos.edge) {
            let key = new LineKey(pos.cornerX, pos.cornerY, pos.edge);
            if (this._cellMap.has(key.string())) {
                let cell = this._cellMap.get(key.string());
                //cell.Erase(this);
                this._cellMap.delete(key.string());
            }
        }
        this._contextEle.clearRect(pos.cornerX, pos.cornerY, this._squareSize, this._squareSize)
    }

    Clear() {
        this._contextEle.clearRect(0, 0, this._width, this._height);
        this._cellMap.clear();
    } 
}