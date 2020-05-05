export interface ICell {
    _x: number;
    _y: number;
    Draw(canvas): void;
    Erase(canvas): void;
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
    edge: number;

    constructor(x, y, edge) {
        this.x = x;
        this.y = y;
        this.edge = edge;
    }
    string() {return this.x.toString()+','+this.y.toString()+','+this.edge.toString()}
}