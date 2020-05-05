import { ICanvas } from '../interfaces/canvas-interface';
import { TokenCell } from '../../save-manager/cell';
import SaveManager from '../../save-manager/save-manager';

class Token {
    x : any;
    y : any;
    shape : any;
    color : any;
    name : any;
    icon : any;
    constructor (x, y, shape, color, icon) {
      this.x = x;
      this.y = y;
      this.shape = shape;
      this.color = color;
      this.icon = icon;
    }
  }

export class TokenCanvas implements ICanvas {
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
    _drawingOn: boolean;
    _panning: boolean;
    _lastDragX: number;
    _currentColor: any;
    _currentIcon: any;
    _draggingToken: boolean;
    _session: number;
    private _tokenMap: Map<string, Token>;
    private _grabbedToken: any;
    private _lastTokenX: any;
    private _lastTokenY: any;
    private _saveManager: SaveManager;
    GetSquarePos: (e, sqSz, w, h) => any;

    constructor (id, w, h, sqSz, getSqFunc, session) {
        this._session = session;
        this._id = id;
        this._height = h;
        this._width = w;
        this._squareSize = sqSz;
        this._canvasEle = document.createElement("canvas");
        this._canvasEle.width = w;
        this._canvasEle.height = h;
        this._contextEle = this._canvasEle.getContext('2d');
        this._draggingToken = false;
        this.GetSquarePos = getSqFunc;
        this._tokenMap = new Map<string, Token>();
        this.SetupListeners();
        this._saveManager = new SaveManager(this);
    }

    private SetupListeners() {
        this._canvasEle.addEventListener('mousedown', e => {
            this.MouseDown(e)
        })
        this._canvasEle.addEventListener('mousemove', e => {
            this.MouseMove(e)
        })
        this._canvasEle.addEventListener('mouseup', e => {
            this.MouseUp(e)
        })
    }

    MouseDown(e) {
        switch(e.which) {
            case 1: 
                this.Draw(e);
                break;
            case 2:
                break;
            case 3:
        }
    }

    MouseMove(e) {
        switch(e.which) {
            case 1: 
                if (this._draggingToken) {
                    this.DragToken(e);
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
                this.EndDraw(e);
                break;
            case 2:
                break;
            case 3:
                this.Erase(e);
        }
    }

    private CreateToken(x, y, color, icon) {
        let newToken = new Token(x, y, 'circle', color, icon);
        this._tokenMap.set(x.toString()+','+y.toString(), newToken)
        this.DrawToken(newToken);
      }

    private DrawToken(token) {
        this._contextEle.beginPath();
        this._contextEle.arc(token.x + (this._squareSize/2), token.y + (this._squareSize/2), (this._squareSize/2) - 2, 0, 2 * Math.PI, false);
        if (this._currentColor == 'black') {
          this._contextEle.fillStyle = 'white';
        } else {
          this._contextEle.fillStyle = token.color;
        }
        this._contextEle.lineWidth = 2;
        this._contextEle.closePath();
        this._contextEle.fill();
        this._contextEle.stroke();
        this._contextEle.drawImage(token.icon, token.x, token.y);  
    }

    private DragToken(e) {
        let posData = this.GetSquarePos(e, this._squareSize, this._width, this._height)
        if (this._draggingToken) {
            this._grabbedToken.x = posData.cornerX
            this._grabbedToken.y = posData.cornerY
          }
        this.DrawAllTokens();
    }

    private DrawAllTokens() {
        this._contextEle.clearRect(0, 0, this._canvasEle.width, this._canvasEle.height);
        this._tokenMap.forEach(token => {
          this.DrawToken(token);
        })
    }

    Draw (e) {
        let posData = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        let key = posData.cornerX.toString()+','+posData.cornerY.toString()
        if (this._tokenMap.has(key)) {
            this._draggingToken = true;
            this._grabbedToken = this._tokenMap.get(key)
            this._lastTokenX = this._grabbedToken.x;
            this._lastTokenY = this._grabbedToken.y;
        } else {
            this.CreateToken(posData.cornerX, posData.cornerY, this._currentColor, this._currentIcon);
            let cell = new TokenCell(posData.cornerX, posData.cornerY, this._currentColor);
            cell._icon = this._currentIcon.src;
            this._saveManager.Save(cell);
        }
    }

    EndDraw(e) {
        if (this._draggingToken == true) {
            this._draggingToken = false;
            let newKey = this._grabbedToken.x.toString()+','+this._grabbedToken.y.toString()
            if (this._tokenMap.has(newKey)) {
                this._grabbedToken.x = this._lastTokenX;
                this._grabbedToken.y = this._lastTokenY;
                this.DrawAllTokens();
            } else {
                let lastKey = this._lastTokenX.toString()+','+this._lastTokenY.toString();
                this._tokenMap.delete(lastKey)
                this._tokenMap.set(newKey, this._grabbedToken)  
                this._saveManager.Erase({x: this._lastTokenX, y: this._lastTokenY});
                let cell = new TokenCell(this._grabbedToken.x, this._grabbedToken.y, this._currentColor);
                cell._icon = this._grabbedToken.icon.src;
                this._saveManager.Save(cell);
            }
        }
    }

    Erase(e) {
        let posData = this.GetSquarePos(e, this._squareSize, this._width, this._height);
        this._contextEle.clearRect(posData.cornerX, posData.cornerY - .5, this._squareSize + .5, this._squareSize + .5)
        let key = posData.cornerX.toString()+','+posData.cornerY.toString()
        this._tokenMap.delete(key);
        this._saveManager.Erase({x: posData.cornerX, y: posData.cornerY});
    }

    EndErase(e) {
        
    }

    Key(x, y) { 
        return x.toString()+','+y.toString();
    }

    DrawCell(cell) { 
        if (cell) {
            let key = this.Key(cell._x, cell._y);
            if (!this._tokenMap.has(key)) {
                let src = cell._icon;
                let icon = new Image();
                icon.src = src;
                this.CreateToken(cell._x, cell._y, cell._color, icon);
            }
        }
    }

    EraseCell(key) {
        this._contextEle.clearRect(key.x, key.y, this._squareSize, this._squareSize);
    }

    Pan(e, lastDragX) {
        let styleLeft = (e.clientX - lastDragX) + 'px';
        let styleRight = (e.clientX + lastDragX) + 'px';

        this._canvasEle.style.left = styleLeft;
        this._canvasEle.style.right = styleRight;
    }

    Clear() {
        this._contextEle.clearRect(0, 0, this._width, this._height);
    }
}