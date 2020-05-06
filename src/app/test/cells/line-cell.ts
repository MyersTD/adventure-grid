import { ICell } from './interface/cell-interface';

export class LineCell implements ICell {
    _x: number; //anchor
    _y: number; //anchor
    _x2: number; //end
    _y2: number;
    _color: any;

    constructor(x, y, color) {
        this._x = x;
        this._y = y;
        this._color = color;
    }

    Draw(canvas) { 
        canvas._contextEle.beginPath();
        canvas._contextEle.moveTo(this._x, this._y);
        canvas._contextEle.setLineDash([]);
        canvas._contextEle.strokeStyle = this._color;
        canvas._contextEle.lineWidth = 4;
        canvas._contextEle.lineTo(this._x2, this._y2);
        canvas._contextEle.stroke();
        canvas._contextEle.closePath();
    }

    Erase(canvas) {
        let comp = canvas._contextEle.globalCompositeOperation;
        canvas._contextEle.globalCompositeOperation = "destination-out"
        canvas._contextEle.beginPath();
        canvas._contextEle.moveTo(this._x, this._y);
        canvas._contextEle.setLineDash([]);
        canvas._contextEle.strokeStyle = "rgba(0,0,0,1)";
        canvas._contextEle.lineWidth = 4;
        canvas._contextEle.lineTo(this._x2, this._y2);
        for (let i = 0; i < 20; i++) {
            canvas._contextEle.stroke();
        }
        canvas._contextEle.closePath();
        canvas._contextEle.globalCompositeOperation = comp;
    }

    TempErase(canvas) {
        canvas._contextEle.beginPath();
        canvas._contextEle.moveTo(this._x, this._y);
        canvas._contextEle.setLineDash([4, 10]);

        if (this._color == 'black') {
            canvas._contextEle.strokeStyle = 'lightgrey';
        } else {
            canvas._contextEle.strokeStyle = 'black';
        }
 
        canvas._contextEle.lineWidth = 6;
        canvas._contextEle.lineTo(this._x2, this._y2);
        canvas._contextEle.stroke();
        canvas._contextEle.closePath();
    }
}