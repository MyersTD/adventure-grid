const Key = require('./cell').Key;

    function CreateToken(sid, db, callback) {
        db.query(`
            INSERT INTO tok_history
            (sid, history)
            VALUES (${sid}, '')
        `)
    }

    function GetToken(sid, db, callback) {
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

    function SaveToken(data, db, callback) {
        GetToken(data.room, db, (err, res) => {
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

    function LoadToken(data, db, callback) {
        GetToken(data.room, db, (err, res) => {
            if (res.rows[0]) {
                callback(res.rows[0].history);
            } else {
                callback(null);
            }
        })
    }

    exports.Save = SaveToken;
    exports.Load = LoadToken;
    exports.Create = CreateToken;