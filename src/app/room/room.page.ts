import { Component, ViewChild, ElementRef } from '@angular/core';
import { Base64ToGallery, Base64ToGalleryOptions } from '@ionic-native/base64-to-gallery/ngx';
import { Platform, ToastController} from '@ionic/angular'; 
import { NumberSymbol } from '@angular/common';
import { Scroll, Router, ActivatedRoute } from '@angular/router';
import { CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';
import { ThrowStmt } from '@angular/compiler';
import { sizeof } from '../sizeof.compressed';
import { Storage, IonicStorageModule } from '@ionic/storage';
import { Request } from '../requests';
import * as io from 'socket.io-client';
import { canvasCell } from './canvasCell.components';

let squareSize = 20
let debug = false;

class save_scum  {
  save_list: Array<any>
  step = -1
  object: any;

  constructor(page) {
    this.save_list = new Array<any>();
    this.object = page;

    this.object.socket=io('localhost:3001');

    this.object.socket.on('connect', () => {
      this.object.socket.emit('room', ''+this.object.s_id)
      this.object.socket.emit('get last art', ''+this.object.s_id)
      this.object.socket.on('published art', (data) => {
        if (data != null) {
          this.load(data);
        } else {
          console.log('null data')
        }
      })
    })
  }

  cleanArray (index) {
    for (let i = index; i < this.save_list.length; i++) {
      delete this.save_list[i];
    }
    this.save_list.length = index
  }

  save () {
    this.cleanArray(this.step + 1)
    this.step++;
    this.save_list.push(this.object._CANVAS.toDataURL("image/png"));
    console.log(sizeof(this.object._CANVAS.toDataURL("image/png")))

    let jsonTokens = JSON.stringify(Array.from(this.object.tokenMap.entries()));

    this.object.socket.emit('publish', {room: this.object.s_id, history: this.save_list[this.step], tokens: jsonTokens})

    if (debug) { 
      console.log(this.save_list, this.step)
      console.log(sizeof(this.save_list))
    }
  }

  load (data) {
    let snapshot = new Image();
    if (data.tokens) {
      let tokens = new Map(JSON.parse(data.tokens));
        this.object.tokenMap = tokens;
        this.object.drawAllTokens();
    }
    snapshot.src = data.history;
    snapshot.onload = () => {
      this.object._CONTEXT.clearRect(0, 0, this.object._CANVAS.width, this.object._CANVAS.height);
      this.object._CONTEXT.drawImage(snapshot, 0, 0, this.object._CANVAS.width, this.object._CANVAS.height)
    }

  }

  undo () {
    if (this.step != 0 && this.save_list.length > 1) {
      let snapshot = new Image();
      snapshot.src = this.save_list[this.step];
      snapshot.onload = () => {
        this.object._CONTEXT.clearRect(0, 0, this.object._CANVAS.width, this.object._CANVAS.height);
        this.object._CONTEXT.drawImage(snapshot, 0, 0, this.object._CANVAS.width, this.object._CANVAS.height)
        this.object.socket.emit('publish', {room: this.object.s_id, history: this.save_list[this.step]})
      }
      this.step--;
      if (debug) console.log(this.save_list, this.step)
    }
  }

  redo () {
    if (this.step != this.save_list.length - 1) {
      this.step++;
      let snapshot = new Image();
      snapshot.src = this.save_list[this.step];
      snapshot.onload = () => {
        this.object._CONTEXT.clearRect(0, 0, this.object._CANVAS.width, this.object._CANVAS.height);
        this.object._CONTEXT.drawImage(snapshot, 0, 0, this.object._CANVAS.width, this.object._CANVAS.height)
        this.object.socket.emit('publish', {room: this.object.s_id, history: this.save_list[this.step]})
      }
      if (debug) console.log(this.save_list, this.step)
    }
  }
}


class Token {
  x : any;
  y : any;
  shape : any;
  color : any;
  name : any;
  constructor (x, y, shape, color) {
    this.x = x;
    this.y = y;
    this.shape = shape;
    this.color = color;
  }
}

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
  providers: [Request]
})
export class RoomPage {
    @ViewChild('canvas', {static: false}) canvasEl : ElementRef;
    @ViewChild('bgcanvas', {static: false}) bgCanvasEl : ElementRef;
    @ViewChild('gridcanvas', {static: false}) gridCanvasEl : ElementRef;
    @ViewChild('tokencanvas', {static: false}) tokenCanvasEl : ElementRef;
    private _CANVAS  : any;
    private _BGCANVAS : any;
    private _CONTEXT : any;
    private _BGCONTEXT : any;
    private _GRIDCANVAS : any;
    private _GRIDCONTEXT : any;
    private _TOKENCANVAS : any;
    private _TOKENCONTEXT : any;
    private drawing = false;
    private panning = false;
    private selectedColor = 'black'
    private mode = 'draw';
    private s_id: number;
    private lastDragX;
    private manager: save_scum;
    private socket;
    private canvasList: Array<any>;
    private tokenMap: Map<string, Token>;
    private draggingToken = false;
    private grabbedToken: any;
    private lastTokenX: any;
    private lastTokenY: any;

    constructor(private route: ActivatedRoute, private storage: Storage, private request: Request, private router: Router) 
    {
      this.canvasList = new Array<any>();
      this.tokenMap = new Map<string, Token>();
    }

    ionViewDidEnter() : void 
    {      
      this.setup();
      this.route.params.subscribe(params => {
        this.s_id = params['id'];
        this.manager = new save_scum(this);
      });
    }

    setup() {
      this._CANVAS 		        = this.canvasEl.nativeElement;
      this._BGCANVAS          = this.bgCanvasEl.nativeElement;
      this._GRIDCANVAS        = this.gridCanvasEl.nativeElement;
      this._TOKENCANVAS       = this.tokenCanvasEl.nativeElement;
      this._CONTEXT           = this._CANVAS.getContext('2d');
      this._BGCONTEXT         = this._BGCANVAS.getContext('2d');
      this._GRIDCONTEXT       = this._GRIDCANVAS.getContext('2d');
      this._TOKENCONTEXT      = this._TOKENCANVAS.getContext('2d');

      this.canvasList.push({canvas: this._CANVAS, context: this._CONTEXT})
      this.canvasList.push({canvas: this._BGCANVAS, context: this._BGCONTEXT})
      this.canvasList.push({canvas: this._GRIDCANVAS, context: this._GRIDCONTEXT})
      this.canvasList.push({canvas: this._TOKENCANVAS, context: this._TOKENCONTEXT})

      this.canvasList.forEach(ele => {
        ele.canvas.width = 2048;
        ele.canvas.height = 1024;

        ele.canvas.addEventListener('dblclick', e => {
          this.mouseDoubleClickEvent(e);
        })

        ele.canvas.addEventListener('mousedown', e => {
          this.mouseDownEvent(e);
        })
  
        ele.canvas.addEventListener('mousemove', e => {
          this.mouseMoveEvent(e);
        })

        ele.canvas.addEventListener('mouseup', e => {
          this.mouseUpEvent(e);
        })
  
        ele.canvas.addEventListener('contextmenu', e => e.preventDefault());
  
      })

      if(this._CANVAS.getContext)
      {
         this.setupCanvas(this._CANVAS.width, this._CANVAS.height);
      }
    }

    mouseDoubleClickEvent(e) {
      var pos = this.getSquare(e);
      console.log('Double click', pos.x, pos.y)
      switch (e.which) {
        case 1:
          switch (this.mode) {
            case 'token':
              let key = pos.x.toString()+','+pos.y.toString();
              if (this.tokenMap.has(key)) {
                this.nameToken(this.tokenMap.get(key));
              }
              break;
          }
        break;
      }
    }

    mouseDownEvent(e) {
      var pos = this.getSquare(e);
      switch(e.which) {
        // left click
        case 1:
          this.drawing = true;
          this._CONTEXT.beginPath();
          switch(this.mode) {
            case 'pencil':
              this._CONTEXT.moveTo(e.offsetX, e.offsetY)
              this.draw(pos.x, pos.y, pos.dir, this.selectedColor, this.mode);
              break;
            case 'draw':
              this.draw(pos.x, pos.y, pos.dir, this.selectedColor, this.mode);
              break;
            case 'token':
              let key = pos.x.toString()+','+pos.y.toString()
              if (this.tokenMap.has(key)) {
                this.draggingToken = true;
                this.grabbedToken = this.tokenMap.get(key)
                this.lastTokenX = this.grabbedToken.x;
                this.lastTokenY = this.grabbedToken.y;
              } else {
                this.token(pos.x, pos.y, this.selectedColor);
              }
              break;
          }
          break;
        // middle click
        case 2:
          e.preventDefault();
          this.panning = true;
          this.lastDragX = e.clientX - this._CANVAS.offsetLeft;
          break;
        // right click
        case 3:
          switch (this.mode) {
            case 'token':
              let key = pos.x.toString()+','+pos.y.toString()
              if (this.tokenMap.has(key)) {
                this.tokenMap.delete(key)
                this.drawAllTokens();
              }
              break;
            case 'line':
            case 'draw':
            case 'pencil':
              this.drawing = true;
              var pos = this.getSquare(e);
              break;
          }
          break;
      }
    }

    mouseMoveEvent(e) {
      event.preventDefault();
      switch(e.which) {
        // left click
        case 1:
          this.drawing = true;
          var pos = this.getSquare(e)
          switch (this.mode) {
            case 'pencil':
              this.draw(e.offsetX, e.offsetY, pos.dir, this.selectedColor, this.mode)
              break;
            case 'line':
            case 'draw':
              this.draw(pos.x, pos.y, pos.dir, this.selectedColor, this.mode)
          }
          if (this.draggingToken) {
            this.dragToken(e);
          }
          break;

        // middle click
        case 2:
          if (!this.panning) return;
          var styleLeft = (e.clientX - this.lastDragX) + 'px';
          var styleRight = (e.clientX + this.lastDragX) + 'px';

          this.canvasList.forEach(ele => {
            ele.canvas.style.left = styleLeft;
            ele.canvas.style.right = styleRight;
          })
          break;

        // right click
        case 3:
          if (this.mode != 'token') {
            this.drawing = true;
            var pos = this.getSquare(e);
            this.erase(pos.x, pos.y, pos.dir, this.mode);
          }
          break;

      }
    }

    mouseUpEvent(e) {
      switch (e.which) {
        case 1:
        case 3:
          this.drawing = false;
          if (this.draggingToken == true) {
            this.draggingToken = false;
            let newKey = this.grabbedToken.x.toString()+','+this.grabbedToken.y.toString()
            if (this.tokenMap.has(newKey)) {
              this.grabbedToken.x = this.lastTokenX;
              this.grabbedToken.y = this.lastTokenY;
              this.drawAllTokens();
            } else {
              let lastKey = this.lastTokenX.toString()+','+this.lastTokenY.toString();
              this.tokenMap.delete(lastKey)
              this.tokenMap.set(newKey, this.grabbedToken)  
            }
          }
          if (this.mode == 'line') this._CONTEXT.closePath()
          this.manager.save();
        case 2:
          this.panning = false;
      }
    }

    nameToken(token) {

    }

    getSquare(e) {
      var x1 = e.offsetX
      var y1 = e.offsetY
      var vD =  10
      var x2 = 1 +  (Math.floor(e.offsetX / squareSize -.2) * squareSize + (squareSize / vD))
      var y2 = (Math.floor(e.offsetY / squareSize -.2) * squareSize + (squareSize / vD)) - 1
      var dx = x2 - x1
      var dy = y2 - y1
      if (debug) {
        console.log('x1', x1,'y1', y1,'x2', x2,'y2', y2)
        console.log('dx', dx, 'dy', dy)
      }
      var pos;
      var aDy = Math.abs(dy)
      var aDx = Math.abs(dx)
      if (aDy < (squareSize / vD) && (aDx > (squareSize / vD) && aDx < squareSize - (squareSize / vD))) pos = "top"
      else if (aDy > squareSize - (squareSize / vD) && (aDx > (squareSize / vD) && aDx < squareSize - (squareSize / vD))) pos = "bottom"
      else if (aDx < (squareSize / vD) && (aDy > (squareSize / vD) && aDy < squareSize - (squareSize / vD))) pos = "left"
      else if (aDx > squareSize - (squareSize / vD) && (aDy > (squareSize / vD) && aDy < squareSize - (squareSize / vD))) pos = "right"
      if (debug) console.log(pos)
      return {
          x: x2,
          y: y2,
          dir: pos
      };
    }

    erase(x, y, dir, mode) {
      if (!this.drawing) return;
      if (mode == 'line') this._CONTEXT.clearRect(x, y, squareSize, squareSize)
      else this._CONTEXT.clearRect(x, y, squareSize, squareSize)
    }

    draw(x, y, dir, color, mode) {
      if (!this.drawing) return;
      this._CONTEXT.fillStyle = color;
      this._CONTEXT.strokeStyle = color;
      this._CONTEXT.lineWidth = 1.5;
      if (mode == 'draw') {
        this._CONTEXT.fillRect(x, y, squareSize, squareSize)
      }
      if (mode == 'pencil') {
        //Draw a line
        this._CONTEXT.lineTo(x, y);
        this._CONTEXT.closePath();
        this._CONTEXT.stroke();
        //Add an arc to the end of the line to make it smooth
        this._CONTEXT.beginPath();
        this._CONTEXT.arc(x, y, 0, 0, Math.PI * 2);
        this._CONTEXT.closePath();
        this._CONTEXT.stroke();
      }
      if (mode == 'line') {
        if (dir == 'left') {
          this._CONTEXT.moveTo(x, y)
          this._CONTEXT.lineTo(x, y + squareSize)
          this._CONTEXT.stroke()
        }
        if (dir == 'right') {
          this._CONTEXT.moveTo(x + squareSize, y)
          this._CONTEXT.lineTo(x + squareSize, y + squareSize)
          this._CONTEXT.stroke()
        }
        if (dir == 'top') {
          this._CONTEXT.moveTo(x, y)
          this._CONTEXT.lineTo(x + squareSize, y)
          this._CONTEXT.stroke()
        }
        if (dir == 'bottom') {
          this._CONTEXT.moveTo(x, y + squareSize)
          this._CONTEXT.lineTo(x + squareSize, y + squareSize)
          this._CONTEXT.stroke()
        }
      }
    }

    token(x, y, color) {
      let newToken = new Token(x, y, 'circle', color);
      this.tokenMap.set(x.toString()+','+y.toString(), newToken)
      this.drawToken(newToken);
    }

    drawToken(token) {
      this._TOKENCONTEXT.beginPath();
      this._TOKENCONTEXT.arc(token.x + (squareSize/2), token.y + (squareSize/2), (squareSize/2) - 2, 0, 2 * Math.PI, false);
      this._TOKENCONTEXT.fillStyle = token.color;
      this._TOKENCONTEXT.strokeStyle = 'black';
      this._TOKENCONTEXT.lineWidth = 2;
      this._TOKENCONTEXT.closePath();
      this._TOKENCONTEXT.fill();
      this._TOKENCONTEXT.stroke();
    }

    dragToken(e) {
      let pos = this.getSquare(e)
      if (this.draggingToken) {
        this.grabbedToken.x = pos.x
        this.grabbedToken.y = pos.y
      }
      this.drawAllTokens();
    }

    drawAllTokens() {
      this._TOKENCONTEXT.clearRect(0, 0, this._TOKENCANVAS.width, this._TOKENCANVAS.height);
      this.tokenMap.forEach(token => {
        this.drawToken(token);
      })
    }

    redo() {
      this.manager.redo()
    }

    undo() {
      this.manager.undo()
    }

    selectColor(e) {
      var color = e.target.style.backgroundColor;
      this.selectedColor = color;
      console.log(this.selectedColor)
    }

    selectLine() {
      this.mode = "line";
    }

    selectDraw() {
      this.mode = "draw";
    }

    selectPencil() {
      this.mode = "pencil";
    }

    selectToken() {
      this.mode = "token";
    }

    hideGrid() {
      if (this._GRIDCANVAS.style.visibility == 'hidden') {
        this._GRIDCANVAS.style.visibility = 'visible';
      } else {
        this._GRIDCANVAS.style.visibility = 'hidden'
      }
    }

    setupCanvas(width, height)
    {
       this._BGCONTEXT.fillStyle = "beige";
       this._BGCONTEXT.fillRect(0, 0, width, height);

       // Draw Grid

       let nX = Math.floor(width / squareSize) - 2 // number of squares on X
       let nY = Math.floor(height / squareSize) - 2 // number of squares on Y
       let pX = width - nX * squareSize // padding X
       let pY = height - nY * squareSize // padding Y
       let pL = Math.ceil(pX / 2) - 0.5 // padding left
       let pT = Math.ceil(pY / 2) - 0.5 // padding top
       let pR = width - nX * squareSize - pL // padding right
       let pB = height - nY * squareSize - pT // padding bottom

       for (var x = pL; x <= width - pR; x += squareSize) {
        this._GRIDCONTEXT.moveTo(x, pT)
        this._GRIDCONTEXT.lineTo(x, height - pB)
       }

       for (var y = pT; y <= height - pB; y += squareSize) {
        this._GRIDCONTEXT.moveTo(pL, y)
        this._GRIDCONTEXT.lineTo(width - pR, y)
       }

       this._GRIDCONTEXT.strokeStyle = "#ddd"
       this._GRIDCONTEXT.stroke()
    }

    setBackground() {
      this._BGCONTEXT.fillStyle = this.selectedColor;
      this._BGCONTEXT.fillRect(0, 0, this._BGCANVAS.width, this._BGCANVAS.height)
    }

    clearCanvas()
    {
       this._CONTEXT.clearRect(0, 0, this._CANVAS.width, this._CANVAS.height);
       this._TOKENCONTEXT.clearRect(0, 0, this._CANVAS.width, this._CANVAS.height);
       this.tokenMap.clear();
       this.setupCanvas(this._CANVAS.width, this._CANVAS.height);
       this.manager.save()
    }

    goHome() {
      this.router.navigate(['home'])
    }
}
