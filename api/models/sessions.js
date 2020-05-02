/* session model
------------------------------
    sessionid
    history
*/

function createSession(req, db, callback) {
    var s_id = req.body.s_id;
    var history = req.body.history;
    console.log(s_id)
    db.query(
        `INSERT INTO sessions
        (sessionid, history)
        VALUES (${s_id}, '${history}')`,
        (err, res) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else {
                callback(null, res)
            }
        }
    )
}

function getHistory(req, db, callback) {
    var s_id = req.headers.s_id;
    db.query(
        `SELECT history 
        FROM sessions
        WHERE sessionid = ${s_id}`,
        (err, res) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else {
                callback(null, res.rows);
            }
        }
    )
}

function getAllSessions(req, db, callback) {
    db.query(
        `SELECT sessionid
        FROM sessions`,
        (err, res) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else {
                callback(null, res.rows);
            }
        }
    )
}

function saveHistory(req, db, callback) {
    var s_id = req.body.s_id;
    var history = req.body.history;
    var historyjson = JSON.stringify({history: history})
    db.query(
        `UPDATE sessions
        SET history = '${historyjson}'
        WHERE sessionid = ${s_id}`,
        (err, res) => {
            if (err) { 
                console.log(err);
                callback(err, null);
            }
            else {
                callback(null, res);
            }
        }
    )
}

exports.create = createSession;
exports.history = getHistory;
exports.save = saveHistory;
exports.all = getAllSessions;