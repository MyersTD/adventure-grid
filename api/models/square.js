const Key = require('./cell').Key;

    function CreateSquare(sid, db, callback) {
        db.query(`
            INSERT INTO sq_history
            (sid, history)
            VALUES (${sid}, '')
        `)
    }

    function GetSquare(sid, db, callback) {
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

    function LoadSquare(data, db, callback) {
        GetSquare(data.room, db, (err, res) => {
            if (res.rows[0]) {
                callback(res.rows[0].history);
            } else {
                callback(null);
            }
        })
    }

    function SaveSquare(data, db, callback) {
        GetSquare(data.room, db, (err, res) => {
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

exports.Load = LoadSquare;
exports.Save = SaveSquare;
exports.Create = CreateSquare;