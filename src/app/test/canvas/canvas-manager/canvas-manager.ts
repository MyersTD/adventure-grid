import { ICanvas } from '../interfaces/canvas-i'
//import { BackgroundCanvas } from '../test-canvas/background-canvas';
import { BackgroundCanvas } from '../canvas-types/background-canvas'
import { LineCanvas } from '../canvas-types/line-canvas';
import { SquareCanvas } from '../canvas-types/square-canvas';
import { GridCanvas } from '../canvas-types/grid-canvas';
import { TokenCanvas } from '../canvas-types/token-canvas';
import { LinePreviewCanvas } from '../canvas-types/line-prev-canvas';

function CalculatePadding(w, h, sqSz) {
    let nX = Math.floor(w / sqSz) - 2 // number of squares on X
    let nY = Math.floor(h / sqSz) - 2 // number of squares on Y
    let pX = w - nX * sqSz // padding X
    let pY = h - nY * sqSz // padding Y
    let pL = Math.ceil(pX / 2) - 0.5 // padding left
    let pT = Math.ceil(pY / 2) - 0.5 // padding top
    let pR = w - nX * sqSz - pL // padding right
    let pB = h - nY * sqSz - pT // padding bottom

    return {
      left: pL,
      right: pR,
      top: pT,
      bottom: pB,
      x: pX,
      y: pY
    }
}

function CalcSquareEdge(sqSz, vDiff, absDiffX, absDiffY) {
    if (absDiffY < (sqSz / vDiff) && (absDiffX > (sqSz / vDiff) && absDiffX < sqSz - (sqSz / vDiff))) 
        return 'top';
    else if (absDiffY > sqSz - (sqSz / vDiff) && (absDiffX > (sqSz / vDiff) && absDiffX < sqSz - (sqSz / vDiff))) 
        return "bottom"
    else if (absDiffX < (sqSz / vDiff) && (absDiffY > (sqSz    / vDiff) && absDiffY < sqSz - (sqSz / vDiff))) 
        return "left"
    else if (absDiffX > sqSz - (sqSz / vDiff) && (absDiffY > (sqSz / vDiff) && absDiffY < sqSz - (sqSz / vDiff))) 
        return "right"
}

function CalcCorners(sqSz, vDiff, absDiffX, absDiffY) {
        let bound = sqSz/2;
        if (absDiffX < bound && absDiffY < bound) return 'top-left'
        else if (absDiffX > sqSz - bound && absDiffY < bound) return 'top-right'
        else if (absDiffX > sqSz - bound && absDiffY > sqSz - bound) return 'bottom-right'
        else if (absDiffX < bound && absDiffY > sqSz - bound) return 'bottom-left'
        else return 'center'
}

function CalcSquarePos(e, sqSz, w, h) {
    let left = parseInt(e.target.style.left);
    let top = parseInt(e.target.style.top);
    let x1 = e.offsetX - left, 
        y1 = e.offsetY - top/2;
    let variableDiff = 6;
    let padding = CalculatePadding(w, h, sqSz);
    let x2 = (Math.floor(x1 / sqSz - (sqSz/w) - .1) * sqSz + padding.left) - sqSz,
        y2 = (Math.floor(y1 / sqSz - (sqSz/h) - .1) * sqSz + padding.top) - sqSz
    let diffX = x2 - x1, 
        diffY = y2 - y1;
    // console.log('x1', x1, 'y1', y1, 'x2', x2, 'y2', y2)
    // console.log('dX', diffX, 'dY', diffY);
    return {
        cornerX: x2,
        cornerY: y2,
        centerX: x2 + (sqSz/2),
        centerY: y2 + (sqSz/2),
        edge: CalcSquareEdge(sqSz, variableDiff, Math.abs(diffX), Math.abs(diffY)),
        corner: CalcCorners(sqSz,  variableDiff, Math.abs(diffX), Math.abs(diffY))
    }
} 

function CanvasFactory(id, height, width, squareSize, session) {
    switch (id) {
        case 'background':
            return new BackgroundCanvas(id, squareSize, width, height, CalcSquarePos);
        case 'line':
            return new LineCanvas(id, squareSize, width, height, CalcSquarePos);
        case 'square':
            return new SquareCanvas(id, squareSize, width, height, CalcSquarePos);
        case 'grid':
            return new GridCanvas(id, squareSize, width, height, CalcSquarePos);
        case 'token':
            return new TokenCanvas(id, squareSize, width, height, CalcSquarePos);
    }
}

export default class CanvasManager {
    //_saveManager: SaveManager;
    _canvas: ICanvas;
    _parent: any;
    constructor(parent, id, squareSize, width, height, session) {
        //this._saveManager = new SaveManager(this)
        this._canvas = CanvasFactory(id, height, width, squareSize, session);
        this._canvas._canvasEle.id = id;
        this._canvas._canvasEle.style.position = 'absolute';
        this._canvas._canvasEle.style.top = '0';
        this._canvas._canvasEle.style.left = '0';
        this._canvas._canvasEle.style.bottom = '0';
        this._canvas._canvasEle.style.right = '0';
        this._canvas._canvasEle.style.backgroundColor = 'transparent';
        this._canvas._canvasEle.style.margin = 'auto';
        this._canvas._canvasEle.style.pointerEvents = 'none';
        this._parent = parent;
        this._parent.appendChild(this._canvas._canvasEle);
        if (id == 'line') {
            let previewCanvas = new LinePreviewCanvas('preview', squareSize, width, height, CalcSquarePos);
            previewCanvas._canvasEle.style.position = 'absolute';
            previewCanvas._canvasEle.style.top = '0';
            previewCanvas._canvasEle.style.left = '0';
            previewCanvas._canvasEle.style.bottom = '0';
            previewCanvas._canvasEle.style.right = '0';
            previewCanvas._canvasEle.style.backgroundColor = 'transparent';
            previewCanvas._canvasEle.style.margin = 'auto';
            previewCanvas._canvasEle.style.pointerEvents = 'none';
            this._canvas._previewCanvas = previewCanvas;
            this._parent.appendChild(previewCanvas._canvasEle);
        }
    }
}