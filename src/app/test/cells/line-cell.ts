import { ICell } from './interface/cell-interface';

export class LineCell implements ICell {
    _x: number;
    _y: number;
    _edge: any;
    _color: any;

    constructor(x, y, edge, color) {
        this._x = x;
        this._y = y;
        this._edge = edge;
        this._color = color;
    }

    Draw(canvas) { 
        let sqSz = canvas._squareSize;
        canvas._contextEle.beginPath();
        canvas._contextEle.strokeStyle = this._color;
        canvas._contextEle.strokeStyle = 2;
        switch (this._edge) {
            case 'top':
                canvas._contextEle.moveTo(this._x, this._y);
                canvas._contextEle.lineTo(this._x + sqSz, this._y);
                break;
            case 'bottom':
                canvas._contextEle.moveTo(this._x, this._y + sqSz);
                canvas._contextEle.lineTo(this._x + sqSz, this._y + sqSz);
                break;
            case 'left':
                canvas._contextEle.moveTo(this._x, this._y);
                canvas._contextEle.lineTo(this._x, this._y + sqSz);
                break;
            case 'right':
                canvas._contextEle.moveTo(this._x + sqSz, this._y);
                canvas._contextEle.moveTo(this._x + sqSz, this._y + sqSz);
                break;
        }
        canvas._contextEle.stroke();
        canvas._contextEle.closePath();
    }

    Erase(canvas) {
        let sqSz = canvas._squareSize;
        canvas._contextEle.clearRect(this._x, this._y, sqSz, sqSz)
        // switch (this._edge) {
        //     case 'top':
        //         canvas._contextEle.clearRect(this._x, this._y, sqSz, 4)
        //         break;
        //     case 'bottom':
        //         canvas._contextEle.clearRect(this._x, this._y + sqSz, sqSz, 4)
        //         break;
                
        //     case 'left':
        //         canvas._contextEle.clearRect(this._x, this._y, 4, sqSz)
        //         break;
        //     case 'right':
        //         canvas._contextEle.clearRect(this._x + sqSz, this._y, 4, sqSz)
        //         break;
        // }
    }
}