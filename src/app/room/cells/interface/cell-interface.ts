export interface ICell {
    _x: number;
    _y: number;
    Draw(canvas): void;
    Erase(canvas): void;
    TempErase?(canvas): void;
    FromData?(cell: ICell): ICell;
}

export class Key {
    x: number;
    y: number;

    constructor(x, y) {this.x = x; this.y = y;}
    string() {return this.x.toString()+','+this.y.toString()}
}

export class LineKey {
    x: number;
    y: number;
    x2: number;
    y2: number;

    constructor(x, y, x2, y2) {
        this.x = x;
        this.y = y;
        this.x2 = x2;
        this.y2 = y2;
    }
    string() {return this.x.toString()+','+this.y.toString()+','+this.x2.toString()+','+this.y2.toString()}
}