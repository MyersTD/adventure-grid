import { ICanvas } from '../interfaces/canvas-i';
import { ICell, LineKey } from '../../cells/interface/cell-interface';

export class LinePreviewCanvas implements ICanvas {
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
        this.GetSquarePos = getSqFunc;
    }
    
    MouseDown(e) {

    }
    MouseUp(e) {

    }
    MouseMove(e) {

    }
}