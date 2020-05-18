import { ICanvas } from '../canvas/interfaces/canvas-i';
import * as io from 'socket.io-client';
import CanvasManager from '../canvas/canvas-manager/canvas-manager';

export class SyncManager {
    _canvasMap: Map<string, CanvasManager>;
    _chat: any;
    _socket: any;
    _session: any;

    constructor(canvasMap, session) {
        this._canvasMap = canvasMap;
        this._socket = io('localhost:3001');
        this._session = session;

        this._socket.on('connect', () => {
            this._socket.emit('room', ''+this._session);
            this._socket.emit('sync last', ''+this._session);
            
            this._socket.on('sync load', (data) => {
                this.Subscribe(data);
            })

            this._socket.on('sync all set', (data) => {
                this.LoadHistory(data);
            })

            this._socket.on('sync message received', (data) => {
                this._chat.SubscribeMessage(data);
            })

            this._socket.on('sync roll received', (data) => {
                this._chat.SubscribeRoll(data);
            })
        })

        this._canvasMap.forEach(canvas => {
            canvas._canvas._sync = this;
        })

        //Load history map of the square-canvas
        this.LoadAll('square');
        this.LoadAll('token');
        this.LoadAll('line');
    }

    SendMessage(nick, message) {
        let data = {nickname: nick, message: message, room: this._session}
        this._socket.emit('sync message send', data);
    }

    SendRoll(nick, message, answer) {
        let data = {nickname: nick, message:message, roll: answer, room: this._session}
        this._socket.emit('sync roll send', data);
    }

    Subscribe(data) {
        let canvas = this._canvasMap.get(data.id);
        canvas._canvas.Subscribe(data);
    }

    Publish(id, mode, cell) {
        let data = {
            id: id,
            mode: mode,
            cell: cell,
            room: this._session
        }
        this._socket.emit('sync save', data);
    }

    LoadHistory(data) {
        let canvas = this._canvasMap.get(data.id);
        canvas._canvas.LoadHistory(data);
    }

    LoadAll(id) {
        let data = {
            id: id,
            room: this._session
        }

        this._socket.emit('sync all get', data);
    }
}