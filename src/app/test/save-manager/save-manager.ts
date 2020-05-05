import CanvasManager from '../canvas/canvas-manager/canvas-manager';
import { ICanvas } from '../canvas/interfaces/canvas-interface';
import { ICell } from './cell';
import SocketManager from '../socket-helper/sockets';

export default class SaveManager {
    _savesMap: Map<string, ICell>;
    _step = 0;
    _canvas: ICanvas;
    _socketManager: SocketManager;

    constructor(canvas) {
        this._canvas = canvas;
        this._savesMap = new Map<string, ICell>();
        this._socketManager = new SocketManager(this, canvas._session);
    }

    Key(x, y) { 
        return x.toString()+','+y.toString();
    }

    Save(cell) {
        let key = this.Key(cell._x, cell._y);
        this._savesMap.set(key, cell);
        this._socketManager.PublishCell(cell);
    }

    Erase(key) { 
        this._savesMap.delete(this.Key(key.x, key.y));
        this._socketManager.PublishEraseCell(key);
    }

    Load() {
        this._savesMap.forEach(cell => {
            this.asyncLoad(cell);
        })
    }

    private async asyncLoad(cell) {
        this._canvas.DrawCell(cell);
    }

    LoadCell(cell) {
        this._savesMap.set(this.Key(cell._x, cell._y), cell);
        this.asyncLoadCell(cell);
    }

    private async asyncLoadCell(cell) {
        this._canvas.DrawCell(cell);
    }

    EraseCell(key) {
        //this._canvas.EraseCell(key);
    }

    Clear() {
        this._socketManager.PublishClear();
    }

    ClearAll() {
        this._canvas.Clear();
    }
}