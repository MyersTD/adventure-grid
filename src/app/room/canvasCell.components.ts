import {Component, Input, OnInit, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'canvas-cell',
  template: `
      <canvas #myCanvas 
      [id]="canvas.canvas.id" 
      [width]="canvas.size" 
      [height]="canvas.size" 
      style="
      border:1px solid #ddd;
      margin:0px;
      padding:0px;">
      
      </canvas>
  `
})
export class canvasCell {
  
  @Input() canvas;
  @ViewChild('myCanvas', {static: false}) canvasRef: ElementRef;
  //cvs:HTMLCanvasElement;
  
  constructor(private elementRef: ElementRef) {
    
  }
 
  ngOnInit(){
   
  }
  
  ngAfterViewInit() {
    
    let canvasElement = this.canvasRef.nativeElement;
    let ctx = canvasElement.getContext("2d");
    // Generate on click events
    canvasElement.addEventListener('mousedown', e => {
      console.log('this is a cell');
    })
  }
}