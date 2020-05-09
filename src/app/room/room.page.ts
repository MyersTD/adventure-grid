import { sizeof } from '../sizeof.compressed';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage, IonicStorageModule } from '@ionic/storage';
import { Request } from '../requests';
import { ChatManager } from './chat-manager/chat';
import CanvasManager from './canvas/canvas-manager/canvas-manager';
import { SyncManager } from './sync/sync-manager'
import { AlertController } from '@ionic/angular';

const tokenDir = '../../assets/tokens';

let squareSize = 30
let debug = false;
let baseHeight = 2048;
let baseWidth = 2048;

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
  providers: [Request]
})
export class RoomPage {
    _lastDragX: any;
    _lastDragY: any;
    _styleTop: any;
    _styleLeft: any;
    _offsetX: any;
    _offsetY: any;
    _canvasContainer: any;
    _panning: any;
    _canvasList: Map<String, CanvasManager>;
    _mode: any;
    _tokenSelected: boolean = false;
    _icon: any;
    _iconsList: Array<any>;
    _selectedColor: any;
    _linePreviewCanvas: any;
    _chatManager: any;
    _sessionId: any;
    _sessionName: any;
  
    constructor(private storage: Storage, private alertCtrl: AlertController, private route: ActivatedRoute, private request: Request, private router: Router) { 
      this.route.params.subscribe(params => {
        this._sessionId = params['id'];
        this._sessionName = params['sname'];
      })
      this._canvasList = new Map<String, CanvasManager>();
      this._iconsList = new Array<any>();
      this.CreateImages();
      this._mode = 'square';
      this._styleLeft = 0;
      this._styleTop = 0;
      this._chatManager = new ChatManager(this.storage, this.alertCtrl);
    }
  
    CreateImage(src) {
      var img = new Image();
      img.src = src;
      return img;
    }

    CreateImages() {
      this.request.GetTokenNames((response) => {
        if (response) {
          response.files.forEach(file => {
            this._iconsList.push(this.CreateImage(tokenDir + '/' + file))
          })
        }
      })
    }
  
    Offset() {
      let bound = this._canvasList.get('background')._canvas._canvasEle.getBoundingClientRect();
      this._offsetX = bound.left;
      this._offsetY = bound.top;
    }
  
    SetupListeners() {
      this._canvasContainer.addEventListener('mousedown', e => {
        e.preventDefault();
        switch(e.which) {
            case 2:
                this.Offset();
                this._lastDragX = e.clientX - this._offsetX;
                this._lastDragY = e.clientY - this._offsetY;
                break;
            default:
              if (this._canvasList.has(this._mode)) {
                this._canvasList.get(this._mode)._canvas.MouseDown(e);
              }
        }
    })
    this._canvasContainer.addEventListener('mousemove', e => {
      e.preventDefault();
        switch(e.which) {
            case 2: 
                this.Pan(e);
                break;
            default:
              if (this._canvasList.has(this._mode)) {
                this._canvasList.get(this._mode)._canvas.MouseMove(e);
              }
        }
    })
    this._canvasContainer.addEventListener('mouseup', e => {
      e.preventDefault();
        switch(e.which) {
            case 2:
                break;
            default:
              if (this._canvasList.has(this._mode)) {
                try {
                  this._canvasList.get(this._mode)._canvas.MouseUp(e);
                } catch {}
              }
        }
    })
  
    this._canvasContainer.addEventListener('dblclick', e => {
      e.preventDefault();
      switch(e.which) {
        case 1:
          if (this._canvasList.has(this._mode)) {
            try {
              this._canvasList.get(this._mode)._canvas.DoubleClick(e);
            } catch {} // Do nothing if the function doesnt exist for this canvas
          }
          break;
        default:
          break;
      }
      console.log('dbl click');
    })
  
    this._canvasContainer.addEventListener('contextmenu', e => {
      e.preventDefault();
    })
    }
  
    ngOnInit() {
      this._canvasContainer = document.getElementById('page');
      this._canvasContainer.style.height = '2048px';
      this._canvasContainer.style.width = '2048px';
      this._canvasContainer.style.position = 'absolute';
      this._canvasContainer.style.top = '0';
      this._canvasContainer.style.left = '0';
      this._canvasContainer.style.bottom = '0';
      this._canvasContainer.style.right = '0';
      this._canvasContainer.style.backgroundColor = 'transparent';
      this._canvasContainer.style.margin = 'auto';
      this.SetupListeners();
      this._canvasList.set('background', new CanvasManager(this._canvasContainer, 'background', squareSize, baseWidth, baseHeight));
      this._canvasList.set('square', new CanvasManager(this._canvasContainer, 'square', squareSize, baseWidth, baseHeight));
      this._canvasList.set('token', new CanvasManager(this._canvasContainer, 'token', squareSize, baseWidth, baseHeight));
      this._canvasList.set('grid', new CanvasManager(this._canvasContainer, 'grid', squareSize, baseWidth, baseHeight));
      this._canvasList.set('line', new CanvasManager(this._canvasContainer, 'line', squareSize, baseWidth, baseHeight));
      this.setColor('black');
      new SyncManager(this._canvasList, this._sessionId);
      window.onscroll = (e) => {this.Offset();}
      window.onresize = (e) => {this.Offset();}
    }
  
    selectColor(e) {
      var color = e.target.style.backgroundColor;
      this.setColor(color);
    }
  
    setColor(color) {
      this._canvasList.forEach(ele => {
        ele._canvas._currentColor = color;
      })
    }
  
    selectLine() {
      this._mode = "line";
    }
  
    selectDraw() {
      this._mode = "square";
    }
  
    selectPencil() {
      this._mode = "pencil";
    }
  
    selectIcon(e, icon) {
      this._mode = "token"
      this._canvasList.get('token')._canvas._currentIcon = icon;
      this._tokenSelected = false;
    }
  
    selectToken() {
      //this.mode = "token";
      if (this._tokenSelected == false) {
        this._tokenSelected = true;
      } else {
        this._tokenSelected = false;
      }
    }
  
    setNickname() {
      let alert = this.alertCtrl.create({
        inputs: [
          {
            name: 'nickname',
            placeholder: 'nickname'
          }
        ],
        buttons: [
          {
            text: 'Done',
            handler: data => {
              this.storage.set('nickname', data.nickname);
              this._chatManager.nickName = data.nickname;
            }
          }
        ],
        
      }).then((al) => {
        al.present();
      })
    }
  
    hideGrid() {
      if (this._canvasList.get('grid')._canvas._canvasEle.style.visibility == 'hidden') {
        this._canvasList.get('grid')._canvas._canvasEle.style.visibility = 'visible';
      } else {
        this._canvasList.get('grid')._canvas._canvasEle.style.visibility = 'hidden';
      }
    }
  
    Pan(e) {
  
      e.preventDefault();
      e.stopPropagation();
    
      let mouseX = e.clientX - this._offsetX;
      let mouseY = e.clientY - this._offsetY;
  
      let dx = mouseX - this._lastDragX;
      let dy = mouseY - this._lastDragY;
  
      this._lastDragX = mouseX;
      this._lastDragY = mouseY;
  
      this._styleLeft += dx;
      this._styleTop += dy;
      //console.log('mouseX', mouseX, 'mouseY', mouseY, 'dx', dx, 'dy', dy, 'styleLeft', this._styleLeft, 'styleTop', this._styleTop)
  
      this._linePreviewCanvas = this._canvasList.get('line')._canvas._previewCanvas;
  
      this._canvasList.forEach(canvas => {
        canvas._canvas._canvasEle.style.left = this._styleLeft + 'px';
        canvas._canvas._canvasEle.style.top = this._styleTop + 'px';
      })
      this._canvasContainer.style.left = this._styleLeft + 'px';
      this._canvasContainer.style.top = this._styleTop + 'px';
      this._linePreviewCanvas._canvasEle.style.left = this._styleLeft + 'px';
      this._linePreviewCanvas._canvasEle.style.top = this._styleTop + 'px';
    }
  
    clearCanvas() {
      this._canvasList.forEach(ele => {
        ele._canvas.Clear();
      })
    }

    goHome() {
      this.router.navigate(['home'])
    }
}
