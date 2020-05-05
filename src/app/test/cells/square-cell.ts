import { ICell } from './interface/cell-interface';

export class SquareCell implements ICell {
    _x: number;
    _y: number;
    _color: any;

    constructor(x, y, color) {
        this._x = x;
        this._y = y;
        this._color = color;
    }

    Draw(canvas) { 
        let sqSz = canvas._squareSize;
        canvas._contextEle.fillStyle = this._color;
        canvas._contextEle.fillRect(this._x + .5, this._y + .5, sqSz, sqSz);
    }

    Erase(canvas) { 
        let sqSz = canvas._squareSize;
        canvas._contextEle.clearRect(this._x + .5, this._y + .5, sqSz, sqSz);
    }
}