var io = require('socket.io'), http = require('http')

class ICell {
    _x
    _y
    _icon
    _color
}

class Key {
    _x
    _y
    _x2
    _y2
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    string() {
        return this._x.toString()+','+this._y.toString();
    }
    stringLine() {
        return this._x.toString()+','+this._y.toString()+','+this._x2.toString()+','+this._y2.toString();
    }
}

const Pool = require('pg').Pool
const CONFIG = require('./config/config.json')

const db = new Pool({
  user: CONFIG.user,
  host: CONFIG.host,
  database: CONFIG.database,
  password: CONFIG.password,
  port: CONFIG.port,
})

server = http.createServer()

io = io.listen(server);

io.on('connection', onConnect);

function onConnect(socket) {
    console.log('User Connected', socket.id);
    
    socket.on('room', function(room) {
      socket.join(room);
      console.log('connected to: ', room)
    });
  
    socket.on('create room', function(room) {
      socket.join(room)
      db.query(
        `INSERT INTO sessions
        (sessionid, history)
        VALUES (${room}, '')`,
        (err, res) => {
            if (err) {
                console.log(err);
            }
        })
    })

    socket.on('sync save', function(data) {
        console.log(data)
        switch (data.id) {
            case 'square':
                SaveSquare(data, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                break;
            case 'line':
                SaveLine(data, (err) => {
                    if (err) {
                        console.log(err);
                    }
                })
                break;
            case 'token':
                SaveToken(data, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                break;
        }
        io.to(data.room).emit('sync load', data);
    })

    socket.on('sync all get', function(data) {
        switch(data.id) {
            case 'square':
                LoadSquare(data, (history) => {
                    if (history) {
                        let newData = {history: history, id: data.id}
                        io.to(data.room).emit('sync all set', newData);
                    } 
                });
                break;
            case 'line':
                LoadLine(data, (history) => {
                    if (history) {
                        let newData = {history: history, id: data.id}
                        io.to(data.room).emit('sync all set', newData);
                    } 
                });
                break;
            case 'token':
                LoadToken(data, (history) => {
                    if (history) {
                        let newData = {history: history, id: data.id}
                        io.to(data.room).emit('sync all set', newData);
                    } 
                })
        }
    })
}

function GetSquare(sid, callback) {
    db.query(`
        SELECT history 
        FROM sq_history
        WHERE sid = ${sid}
    `, (err, res) =>{
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, res);
        }
    })
}

function GetToken(sid, callback) {
    db.query(`
        SELECT history 
        FROM tok_history
        WHERE sid = ${sid}
    `, (err, res) =>{
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, res);
        }
    })
}

function GetLine(sid, callback) {
    db.query(`
    SELECT history 
    FROM ln_history
    WHERE sid = ${sid}
`, (err, res) =>{
    if (err) {
        console.log(err);
        callback(err, null);
    } else {
        callback(null, res);
    }
})
}

function SaveLine(data, callback) {
    GetLine(data.room, (err, res) => {
        let map = new Map();
        if (res && res.rows[0] != '') {
            try {
                map = new Map(JSON.parse(res.rows[0].history));
            } catch {

            }
        } 
        if (data.cell) {
            let key = new Key(data.cell._x, data.cell._y);
            key._x2 = data.cell._x2;
            key._y2 = data.cell._y2;
            if (data.mode == 'add') {
                map.set(key.stringLine(), data.cell);
            }
            if (data.mode == 'remove') {
                map.delete(key.stringLine());
            }
        }
        if (data.mode == 'clear') {
            map.clear();
        }
        let map_json = JSON.stringify(Array.from(map.entries()));
        db.query(`
        UPDATE ln_history 
        set history = '${map_json}'
        WHERE sid = ${data.room}
        `, (err, res) => {
            if (err) {
                callback(err);
            } else {
                callback(null)
            }
        })
    })
}

function SaveToken(data, callback) {
    GetToken(data.room, (err, res) => {
        let map = new Map();
        if (res && res.rows[0] != '') {
            try {
                map = new Map(JSON.parse(res.rows[0].history));
            } catch {

            }
        } 
        if (data.cell) {
            let key = new Key(data.cell._x, data.cell._y);
            if (data.mode == 'add') {
                map.set(key.string(), data.cell);
            }
            if (data.mode == 'remove') {
                map.delete(key.string());
            }
        }
        if (data.mode == 'clear') {
            map.clear();
        }
        let map_json = JSON.stringify(Array.from(map.entries()));
        db.query(`
        UPDATE tok_history 
        set history = '${map_json}'
        WHERE sid = ${data.room}
        `, (err, res) => {
            if (err) {
                callback(err);
            } else {
                callback(null)
            }
        })
    })
}

function SaveSquare(data, callback) {
    GetSquare(data.room, (err, res) => {
        let sq_map = new Map();
        if (res && res.rows[0] != '') {
            try {
                sq_map = new Map(JSON.parse(res.rows[0].history));
            } catch {

            }
        } 
        console.log(data)
        if (data.cell) {
            let key = new Key(data.cell._x, data.cell._y);
            if (data.mode == 'add') {
                sq_map.set(key.string(), data.cell);
            }
            if (data.mode == 'remove') {
                sq_map.delete(key.string());
            }
        }
        if (data.mode == 'clear') {
            sq_map.clear();
        }
        let sq_map_json = JSON.stringify(Array.from(sq_map.entries()));
        db.query(`
        UPDATE sq_history 
        set history = '${sq_map_json}'
        WHERE sid = ${data.room}
        `, (err, res) => {
            if (err) {
                callback(err);
            } else {
                callback(null)
            }
        })
    })
}

function LoadSquare(data, callback) {
    GetSquare(data.room, (err, res) => {
        if (res.rows[0]) {
            callback(res.rows[0].history);
        } else {
            callback(null);
        }
    })
}

function LoadToken(data, callback) {
    GetToken(data.room, (err, res) => {
        if (res.rows[0]) {
            callback(res.rows[0].history);
        } else {
            callback(null);
        }
    })
}

function LoadLine(data, callback) {
    GetLine(data.room, (err, res) => {
        if (res.rows[0]) {
            callback(res.rows[0].history);
        } else {
            callback(null);
        }
    })
}

server.listen(3001, function(){
    console.log('Server started on 3001');
});