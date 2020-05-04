export interface ICell {
    _x: number;
    _y: number;
    _color: any;
}

export class DrawingCell implements ICell  {
    _x: number;
    _y: number;
    _color;
    constructor(X, Y, Color) {
        this._x = X;
        this._y = Y;
        this._color = Color;
    }
}

export class LineCell implements ICell { 
    _x: number;
    _y: number;
    _color;
    _edge;
    constructor(edge, X, Y, Color) {
        this._x = X;
        this._y = Y;
        this._color = Color;
        this._edge = edge;
    }
}

export class TokenCell implements ICell { 
    _x: number;
    _y: number;
    _color;
    _icon;
    constructor(X, Y, Color) {
        this._x = X;
        this._y = Y;
        this._color = Color;
    }
}
