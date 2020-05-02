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

let squareSize = 20
let debug = false;

class save_scum  {
  save_list: Array<any>
  step = -1
  canvas: HTMLCanvasElement;
  context: any;
  socket: any;
  s_id: any;

  constructor(canvas, context, socket, s_id) {
    this.save_list = new Array<any>();
    this.canvas = canvas;
    this.context = context;
    this.socket = socket;
    this.s_id = s_id;

    this.socket=io('localhost:3001');

    this.socket.on('connect', () => {
      this.socket.emit('room', ''+this.s_id)
      this.socket.emit('get last art', ''+this.s_id)
      this.socket.on('published art', (data) => {
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
    this.save_list.push(this.canvas.toDataURL("image/png"));
    console.log(sizeof(this.canvas.toDataURL("image/png")))
    this.socket.emit('publish', {room: this.s_id, history: this.save_list[this.step]})

    if (debug) { 
      console.log(this.save_list, this.step)
      console.log(sizeof(this.save_list))
    }
  }

  load (data) {
    let snapshot = new Image();
    snapshot.src = data;
    snapshot.onload = () => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(snapshot, 0, 0, this.canvas.width, this.canvas.height)
    }
  }

  undo () {
    if (this.step != 0 && this.save_list.length > 1) {
      let snapshot = new Image();
      snapshot.src = this.save_list[this.step];
      snapshot.onload = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(snapshot, 0, 0, this.canvas.width, this.canvas.height)
        this.socket.emit('publish', {room: this.s_id, history: this.save_list[this.step]})
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
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(snapshot, 0, 0, this.canvas.width, this.canvas.height)
        this.socket.emit('publish', {room: this.s_id, history: this.save_list[this.step]})
      }
      if (debug) console.log(this.save_list, this.step)
    }
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
    private _CANVAS  : any;
    private _BGCANVAS : any;
    private _CONTEXT : any;
    private _BGCONTEXT : any;
    private drawing = false;
    private panning = false;
    private offset = [0, 0]
    private selectedColor = 'black'
    private mode = 'draw';
    private s_id: number;
    private lastX;
    private lastY;
    private manager: save_scum;
    private socket;

    constructor(private route: ActivatedRoute, private storage: Storage, private request: Request, private router: Router) {}

    socketConnect() {

    }

    ionViewDidEnter() : void 
    {
      this.setup();
      this.route.params.subscribe(params => {
        this.s_id = params['id'];
        this.manager = new save_scum(this._CANVAS, this._CONTEXT, this.socket, this.s_id);
      });
    }

    setup() {
      this._CANVAS 		      = this.canvasEl.nativeElement;
      this._BGCANVAS        = this.bgCanvasEl.nativeElement;
      this._CANVAS.width  	= 1024;
      this._CANVAS.height 	= 1024;
      this._BGCANVAS.width  	= 1024;
      this._BGCANVAS.height 	= 1024;

      this._CANVAS.addEventListener('mousedown', e => {
        this.mouseDownEvent(e);
      })

      this._CANVAS.addEventListener('mousemove', e => {
        this.mouseMoveEvent(e);
      })

      this._CANVAS.addEventListener('mouseup', e => {
        this.mouseUpEvent(e);
      })

      this._CANVAS.addEventListener('contextmenu', e => e.preventDefault());

      if(this._CANVAS.getContext)
      {
         this.setupCanvas(this._CANVAS.width, this._CANVAS.height);
      }
    }

    mouseDownEvent(e) {
      switch(e.which) {
        // left click
        case 1:
          this.drawing = true;
          var pos = this.getSquare(e);
          this.lastX = pos.x;
          this.lastY = pos.y;
          this._CONTEXT.beginPath();
          switch(this.mode) {
            case 'pencil':
              this._CONTEXT.moveTo(e.offsetX, e.offsetY)
              this.draw(e.offsetX, e.offsetY, pos.dir, this.selectedColor, this.mode);
              break;
            case 'draw':
              this.draw(pos.x, pos.y, pos.dir, this.selectedColor, this.mode);
              break;
            case 'token':
              this.token(pos.x, pos.y, this.selectedColor);
              break;
          }
          break;
        // middle click
        case 2:
          this.panning = true;
          this.offset = [
            this._CANVAS.offsetLeft - e.clientX,
            this._CANVAS.offsetTop - e.clientY
          ];
          break;
        // right click
        case 3:
          this.drawing = true;
          var pos = this.getSquare(e);
          this.erase(pos.x, pos.y, pos.dir, this.mode);
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
          break;

        // middle click
        case 2:
          if (!this.panning) return;
          var panPos = this.getPanDirection(e)
          this._CANVAS.style.left =  (panPos.x + this.offset[0]) + 'px';
          this._CANVAS.style.top = (panPos.y + this.offset[1] + 'px');
          this._BGCANVAS.style.left =  (panPos.x + this.offset[0]) + 'px';
          this._BGCANVAS.style.top = (panPos.y + this.offset[1] + 'px');
          break;

        // right click
        case 3:
          this.drawing = true;
          var pos = this.getSquare(e);
          this.erase(pos.x, pos.y, pos.dir, this.mode);
          break;
      }
    }

    mouseUpEvent(e) {
      switch (e.which) {
        case 1:
        case 3:
          this.drawing = false;
          if (this.mode == 'line') this._CONTEXT.closePath()
          this.manager.save();
        case 2:
          this.panning = false;
      }
    }

    getPanDirection(e) {
      return  {
        x: e.clientX,
        y: e.clientY
      }
    }

    getSquare(e) {
      var x1 = e.offsetX
      var y1 = e.offsetY
      var x2 = Math.floor(e.offsetX / squareSize -.2) * squareSize + (squareSize / 10)
      var y2 = Math.floor(e.offsetY / squareSize -.2) * squareSize + (squareSize / 10)
      var dx = x2 - x1
      var dy = y2 - y1
      if (debug) {
        console.log('x1', x1,'y1', y1,'x2', x2,'y2', y2)
        console.log('dx', dx, 'dy', dy)
      }
      var pos;
      var aDy = Math.abs(dy)
      var aDx = Math.abs(dx)
      if (aDy < (squareSize / 10) && (aDx > (squareSize / 10) && aDx < squareSize - (squareSize / 10))) pos = "top"
      else if (aDy > squareSize - (squareSize / 10) && (aDx > (squareSize / 10) && aDx < squareSize - (squareSize / 10))) pos = "bottom"
      else if (aDx < (squareSize / 10) && (aDy > (squareSize / 10) && aDy < squareSize - (squareSize / 10))) pos = "left"
      else if (aDx > squareSize - (squareSize / 10) && (aDy > (squareSize / 10) && aDy < squareSize - (squareSize / 10))) pos = "right"
      if (debug) console.log(pos)
      return {
          x: x2,
          y: y2,
          dir: pos
      };
    }

    erase(x, y, dir, mode) {
      if (!this.drawing) return;
      if (mode == 'line') this._CONTEXT.clearRect(x - 1, y - 1, squareSize + 2, squareSize+ 2)
      else this._CONTEXT.clearRect(x, y, squareSize, squareSize)
    }

    draw(x, y, dir, color, mode) {
      if (!this.drawing) return;
      this._CONTEXT.fillStyle = color;
      this._CONTEXT.strokeStyle = color;
      this._CONTEXT.lineWidth = 1.5;
      if (mode == 'draw') {
        this._CONTEXT.fillRect(x, y, squareSize - 1, squareSize - 1)
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
      this._CONTEXT.beginPath();
      this._CONTEXT.arc(x + (squareSize/2), y + (squareSize/2), (squareSize/2) - 2, 0, 2 * Math.PI, false);
      this._CONTEXT.fillStyle = color;
      this._CONTEXT.fill();
      this._CONTEXT.strokeStyle = 'black';
      this._CONTEXT.lineWidth = 2;
      this._CONTEXT.stroke();
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

    setupCanvas(width, height)
    {
       this._CONTEXT = this._CANVAS.getContext('2d');
       this._BGCONTEXT = this._BGCANVAS.getContext('2d');
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
        this._BGCONTEXT.moveTo(x, pT)
        this._BGCONTEXT.lineTo(x, height - pB)
       }

       for (var y = pT; y <= height - pB; y += squareSize) {
        this._BGCONTEXT.moveTo(pL, y)
        this._BGCONTEXT.lineTo(width - pR, y)
       }

       this._BGCONTEXT.strokeStyle = "#ddd"
       this._BGCONTEXT.stroke()
    }

    clearCanvas()
    {
       this._CONTEXT.clearRect(0, 0, this._CANVAS.width, this._CANVAS.height);
       this.setupCanvas(this._CANVAS.width, this._CANVAS.height);
       this.manager.save()
    }

    goHome() {
      this.router.navigate(['home'])
    }
}
