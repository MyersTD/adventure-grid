import { ICell } from './interface/cell-interface';

export class TokenCell implements ICell {
    _x: number;
    _y: number;
    _icon: any;
    _color: any;
    _name: any;

    constructor(x, y, icon, color) {
        this._x = x;
        this._y = y;
        this._icon = icon;
        this._color = color;
        this._name = '';
    }

    FromData(cell: TokenCell) {
        this._x = cell._x;
        this._y = cell._y;
        this._icon = cell._icon;
        this._color = cell._color;
        return this;
    }

    Draw(canvas) {
        let sqSz = canvas._squareSize;
        canvas._contextEle.beginPath();
        canvas._contextEle.arc(this._x + (sqSz/2), this._y + (sqSz/2), (sqSz/2) - 2, 0, 2 * Math.PI, false);
        if (this._color == 'black') {
            canvas._contextEle.fillStyle = 'white';
        } else {
            canvas._contextEle.fillStyle = this._color;
        }
        canvas._contextEle.lineWidth = 2;
        canvas._contextEle.closePath();
        canvas._contextEle.fill();
        canvas._contextEle.stroke();
        canvas._contextEle.drawImage(this._icon, this._x, this._y);  
        if (this._name != '') {
            canvas._contextEle.font = '14px Arial'
            canvas._contextEle.fillStyle = 'black';
            canvas._contextEle.fillText(this._name, this._x, this._y - 1);
        }
    }

    Erase(canvas) {
        let sqSz = canvas._squareSize;
        canvas._contextEle.clearRect(this._x + .5, this._y + .5, sqSz, sqSz);
    }
}