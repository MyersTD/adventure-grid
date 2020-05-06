import { Component, OnInit } from '@angular/core';
import CanvasManager from './canvas/canvas-manager/canvas-manager'
import { SyncManager } from './sync/sync-manager';
import { LinePreviewCanvas } from './canvas/canvas-types/line-prev-canvas';


@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
})
export class TestPage implements OnInit {

  _lastDragX: any;
  _canvasContainer: any;
  _panning: any;
  _canvasList: Map<String, CanvasManager>;
  _mode: any;
  _tokenSelected: boolean = false;
  _icon: any;
  _iconsList: Array<any>;
  _selectedColor: any;

  constructor() { 
    this._canvasList = new Map<String, CanvasManager>();
    this._iconsList = new Array<any>();
    this._iconsList.push(this.CreateImage('../../assets/tokens/empty.png', 'empty'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/arti.png', 'arti'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/barb.png', 'barb'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/bard.png', 'bard'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/cleric.png', 'cleric'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/druid.png', 'druid'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/fighter.png', 'fighter'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/monk.png', 'monk'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/paladin.png', 'paladin'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/ranger.png', 'ranger'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/rogue.png', 'rogue'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/sorc.png', 'sorc'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/wizard.png', 'wizard'))
    this._iconsList.push(this.CreateImage('../../assets/tokens/warlock.png', 'warlock'))
    this._mode = 'square';
  }

  CreateImage(src, id) {
    var img = new Image();
    img.src = src;
    img.id = id;
    return img;
  }

  SetupListeners() {
    this._canvasContainer.addEventListener('mousedown', e => {
      e.preventDefault();
      switch(e.which) {
          case 2:
              this._lastDragX = e.clientX - this._canvasList.get('background')._canvas._canvasEle.offsetLeft;
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
              this.Pan(e, this._lastDragX);
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
              this._canvasList.get(this._mode)._canvas.MouseUp(e);
            }
      }
  })

  this._canvasContainer.addEventListener('contextmenu', e => {
    e.preventDefault();
  })
  }

  ngOnInit() {
    let session = 12345
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
    this._canvasList.set('background', new CanvasManager(this._canvasContainer, 'background', 30, 2048, 2048, session));
    this._canvasList.set('square', new CanvasManager(this._canvasContainer, 'square', 30, 2048, 2048, session));
    // this._canvasList.set('pencil', new CanvasManager(this._canvasContainer, 'pencil', 30, 2048, 2048, session));
    this._canvasList.set('token', new CanvasManager(this._canvasContainer, 'token', 30, 2048, 2048, session));
    this._canvasList.set('grid', new CanvasManager(this._canvasContainer, 'grid', 30, 2048, 2048, session));
    this._canvasList.set('line', new CanvasManager(this._canvasContainer, 'line', 30, 2048, 2048, session));
    this.setColor('black');
    new SyncManager(this._canvasList);
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

  hideGrid() {
    if (this._canvasList.get('grid')._canvas._canvasEle.style.visibility == 'hidden') {
      this._canvasList.get('grid')._canvas._canvasEle.style.visibility = 'visible';
    } else {
      this._canvasList.get('grid')._canvas._canvasEle.style.visibility = 'hidden';
    }
  }

  Pan(e, lastDragX) {
    this._canvasList.forEach(canvas => {
      let styleLeft = (e.clientX - lastDragX) + 'px';
      let styleRight = (e.clientX + lastDragX) + 'px';
  
      canvas._canvas._canvasEle.style.left = styleLeft;
      canvas._canvas._canvasEle.style.right = styleRight;
    })
  }

  clearCanvas() {
    this._canvasList.forEach(ele => {
      ele._canvas.Clear();
    })
  }
}
