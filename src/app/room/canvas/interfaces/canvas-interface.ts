export interface ICanvas {
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
    _lastDragX?: number;
    _drawingOn?: boolean;
    _panning?: boolean;
    _currentColor?: any;
    _currentIcon?: any;
    GetSquarePos: (e, sqSz, w, h) => any;
    Draw(e): void;
    EndDraw(e): void;
    Erase(e): void;
    EndErase(e): void;
    DrawCell(cell): void;
    Pan(e, lastDragX): void;
    MouseDown(e): void;
    MouseUp(e): void;
    MouseMove(e): void;
    Clear(): void;
}