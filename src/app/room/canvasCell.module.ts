import { canvasCell } from './canvasCell.components';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    canvasCell,
  ],
  exports : [ canvasCell ]
})

export class CanvasCellPageModule { }