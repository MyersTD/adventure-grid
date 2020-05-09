class Key {
    _x
    _y
    _x2
    _y2
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    string() {
        return this._x.toString()+','+this._y.toString();
    }
    stringLine() {
        return this._x.toString()+','+this._y.toString()+','+this._x2.toString()+','+this._y2.toString();
    }
}

exports.Key = Key;