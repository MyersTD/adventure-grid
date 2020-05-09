const Key = require('./cell').Key;

    function CreateLine(sid, db, callback) {
        db.query(`
            INSERT INTO ln_history
            (sid, history)
            VALUES (${sid}, '')
        `)
    }

    function GetLine(sid, db, callback) {
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
    
    function SaveLine(data, db, callback) {
        GetLine(data.room, db, (err, res) => {
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

    function LoadLine(data, db, callback) {
        GetLine(data.room, db, (err, res) => {
            if (res.rows[0]) {
                callback(res.rows[0].history);
            } else {
                callback(null);
            }
        })
    }

exports.Save = SaveLine;
exports.Load = LoadLine;
exports.Create = CreateLine;