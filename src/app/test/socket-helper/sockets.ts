import SaveManager from '../save-manager/save-manager';
import * as io from 'socket.io-client';

export default class SocketManager {
    _saveManager: SaveManager;
    _session: any;
    _socket: any;

    constructor(saveManager, session) { 
        this._saveManager = saveManager;
        this._session = session;
        this.SetupSocketListeners();
    }

    SetupSocketListeners() { 
        this._socket = io('localhost:3001');
        this._socket.on('connect', () => {
            this._socket.emit('room', ''+this._session);
            this._socket.emit('sync last', ''+this._session);
            
            this._socket.on('sync sub', (data) => {
                this.Subscribe(data);
            })

            this._socket.on('sync cell sub', (data) => {
                this.SubscribeCell(data);
            })

            this._socket.on('sync cell sub erase', (data) => {
                this.SubscribeEraseCell(data);
            })

            this._socket.on('sync clear sub', (data) => {
                this.SubscribeClear(data);
            })
        })
    }

    Subscribe(data) {
        if (data != null) {
            if (data.canvas == this._saveManager._canvas._id) {
                this._saveManager._savesMap = new Map(JSON.parse(data.history));
                this._saveManager.Load();
            }
        } else {
            console.log('null data');
        }
    }

    SubscribeCell(data) {
        if (data != null) {
            if (data.canvas == this._saveManager._canvas._id) {
                let cell = JSON.parse(data.cell);
                this._saveManager.LoadCell(cell);
            }
        }
    }

    SubscribeEraseCell(data) {
        if (data != null) {
            if (data.canvas == this._saveManager._canvas._id) {
                let key = JSON.parse(data.key);
                this._saveManager.EraseCell(key);
            }
        }
    }

    SubscribeClear(data) {
        if (data != null) {
            this._saveManager.ClearAll();
        }
    }

    Publish() { 
        let jsonSaves = JSON.stringify(Array.from(this._saveManager._savesMap.entries()));
        let data = {session: this._session, history: jsonSaves, canvas: this._saveManager._canvas._id}
        this._socket.emit('sync pub', data);
    }

    PublishCell(cell) {
        let data = {session: this._session, cell: JSON.stringify(cell), canvas: this._saveManager._canvas._id}
        this._socket.emit('sync cell pub', data);
    }

    PublishEraseCell(key) {
        let data = {session: this._session, key: JSON.stringify(key), canvas: this._saveManager._canvas._id}
        this._socket.emit('sync cell pub erase', data);
    }

    PublishClear() {
        let data = {session: this._session}
        this._socket.emit('sync clear pub', data);
    }
}