import { ICanvas } from '../interfaces/canvas-i';
import { ICell, Key } from '../../cells/interface/cell-interface';
import { TokenCell } from '../../cells/token-cell';
import { AlertController } from '@ionic/angular';

export class TokenCanvas implements ICanvas {
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
    _tokenMap: Map<string, TokenCell>;
    _grabbedToken: any;
    _isDragging: boolean;
    _lastDragX: any;
    _lastDragY: any;
    _currentIcon: any;
    _currentColor: any;
    _name: any;
    _sync: any;

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
        this._tokenMap = new Map<string, TokenCell>();
        this.SetupListeners();
        this.GetSquarePos = getSqFunc;
    }

    private SetupListeners() {
        this._canvasEle.addEventListener('mousedown', e => {
            this.MouseDown(e);
        })
        this._canvasEle.addEventListener('mousemove', e => {
            this.MouseMove(e);
        })
        this._canvasEle.addEventListener('mouseup', e => {
            this.MouseUp(e);
        })
    }

    MouseDown(e) {
        switch(e.which) {
            case 1: 
                if (!this._isDragging) this.Draw(e);
                break;
            case 2:
                break;
            case 3:
                this.Erase(e);
        }
    }

    MouseMove(e) {
        switch(e.which) {
            case 1: 
                if(this._isDragging) {
                    this.Drag(e);
                }
                break;
            case 2: 
                break;
            case 3:
        }
    }

    MouseUp(e) {
        switch(e.which) {
            case 1:
                this.EndDrag(e);
                break;
            case 2:
                break;
            case 3:
        }
     }

     DoubleClick(e) {
         let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
         let key = new Key(pos.cornerX, pos.cornerY);
         if (this._tokenMap.has(key.string())) {
            let token = this._tokenMap.get(key.string());
            let alert = new AlertController();
            alert.create({
                inputs: [
                  {
                    name: 'name',
                    placeholder: 'Name'
                  }
                ],
                buttons: [
                  {
                    text: 'Done',
                    handler: data => {
                      console.log(data.name)
                      token._name = data.name;
                      token.Erase(this);
                      token.Draw(this);
                    }
                  }
                ],
                
              }).then((al) => {
                al.present();
              })
         }
     }

     Draw(e) {
        let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        let key = new Key(pos.cornerX, pos.cornerY);
        if (this._tokenMap.has(key.string())) {
            this._isDragging = true;
            this._grabbedToken = this._tokenMap.get(key.string());
            this._lastDragX = pos.cornerX;
            this._lastDragY = pos.cornerY;
        } else {
            let token = new TokenCell(pos.cornerX, pos.cornerY, this._currentIcon, this._currentColor);
            this._tokenMap.set(key.string(), token);
            token.Draw(this);
            this.Publish(token, 'add');
        }
     }

     Drag(e) {
        let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        if (this._isDragging) {
            this._grabbedToken._x = pos.cornerX;
            this._grabbedToken._y = pos.cornerY;
            this.DrawAll();
        }
     }

     DrawAll() {
        this._contextEle.clearRect(0, 0, this._width, this._height);
        this._tokenMap.forEach(token => {
            token.Draw(this);
        })     
     }

     EndDrag(e) {
        if (this._isDragging == true) {
            this._isDragging = false;
            let newKey = new Key(this._grabbedToken._x , this._grabbedToken._y);
            if (this._tokenMap.has(newKey.string())) {
                this._grabbedToken._x = this._lastDragX;
                this._grabbedToken._y = this._lastDragY;
                this.DrawAll();
            } else {
                let lastKey = new Key(this._lastDragX, this._lastDragY)
                let lastToken = new TokenCell(lastKey.x, lastKey.y, this._grabbedToken._icon, this._grabbedToken._color);
                lastToken._name = this._grabbedToken._name;
                this.Publish(lastToken, 'remove');
                this._tokenMap.delete(lastKey.string())
                this._tokenMap.set(newKey.string(), this._grabbedToken)  
                let token = new TokenCell(this._grabbedToken._x, this._grabbedToken._y, this._grabbedToken._icon, this._grabbedToken._color)
                token._name = this._grabbedToken._name;
                this.Publish(token, 'add');
            }
        }
     }

     Erase(e) {
        let pos = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        let key = new Key(pos.cornerX, pos.cornerY);
        if (this._tokenMap.has(key.string())) {
            let token = this._tokenMap.get(key.string());
            token.Erase(this);
            this.Publish(token, 'remove');
            this._tokenMap.delete(key.string());
        }
     }

     LoadHistory(data) {
        if (data.history != null) {
            let newMap = new Map(JSON.parse(data.history))
            newMap.forEach((cell:any) => {
                let src = cell._icon;
                let icon = new Image();
                icon.src = src;
                icon.onload = () => {
                    let newCell = new TokenCell(cell._x, cell._y, icon, cell._color);
                    newCell._name = cell._name;
                    let key = new Key(cell._x, cell._y);
                    this._tokenMap.set(key.string(), newCell);
                    newCell.Draw(this);
                }
            })
        }
     }

     Subscribe(data) {
         if (data.cell != null) {
             let src = data.cell._icon;
             let icon = new Image();
             icon.src = src;
             icon.onload = () => {
                let cell = new TokenCell(data.cell._x, data.cell._y, icon, data.cell._color);
                cell._name = data.cell._name;
                let key = new Key(cell._x, cell._y);
                if (data.mode == 'add') {
                    this._tokenMap.set(key.string(), cell);
                    cell.Draw(this); 
                } else if (data.mode == 'remove') {
                    if (this._tokenMap.has(key.string())) {
                        this._tokenMap.delete(key.string());
                    }
                    cell.Erase(this);
                }
             }
         } 
         if (data.mode == 'clear') {
             this._contextEle.clearRect(0, 0, this._width, this._height);
             this._tokenMap.clear();
         }
     }

     Publish(cell, mode) {
        let stringedCell = cell;
         if (cell != null) {
            stringedCell = {_x: cell._x, _y: cell._y, _icon: cell._icon.src, _color: cell._color, _name: cell._name};
         } 
         this._sync.Publish(this._id, mode, stringedCell);
     }

    Clear() { 
        this._contextEle.clearRect(0, 0, this._width, this._height);
        this._tokenMap.clear();
        this.Publish(null, 'clear')
    }
}