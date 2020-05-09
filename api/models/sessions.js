/* session model
------------------------------
    sessionid
    history
*/

function createSession(req, db, callback) {
    var s_id = req.body.s_id;
    var name = req.body.name;
    console.log(s_id)
    db.query(
        `INSERT INTO session_info
        (sid, sname)
        VALUES (${s_id}, '${name}')`,
        (err, res) => {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            else {
                console.log('creating')
                callback(null, res)
            }
        }
    )
}

function getAllSessions(req, db, callback) {
    db.query(
        `SELECT sid, sname
        FROM session_info`,
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

exports.create = createSession;
exports.all = getAllSessions;