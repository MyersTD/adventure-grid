export interface ICanvas {
    _id: any;
    _canvasEle: HTMLCanvasElement;
    _contextEle: CanvasRenderingContext2D;
    _squareSize: number;
    _width: number;
    _height: number;
    _currentColor?: any;
    _currentIcon?: any;
    _sync?: any;
    _previewCanvas?: any;
    _name?: any;
    MouseDown(e): void;
    MouseUp(e): void;
    MouseMove(e): void;
    DoubleClick?(e): void;
    GetSquarePos: (e, sqSz, w, h) => any;
    Clear?(): void; 
    Subscribe?(data): void;
    Publish?(cell, mode): void;
    LoadHistory?(data): void;
}