const bcrypt = require('bcryptjs')

function auth_login(db, req, callback) {
    var email = req.body.email;
    var password = req.body.password;
    db.query(`SELECT id, email, password FROM users WHERE "email" = '${email}'`, (err, res) => {
        if (err) {
            console.log(err);
            return callback(err);
        }
        if (res.rows.length > 0) {
            const user = res.rows[0];
            bcrypt.compare(password, user.password, (err, res)=>{
                if (res) {
                    return callback(null, {id: user.id, email: user.email})
                }
                else {
                    return callback(null, false)
                }
            })
        }
        else {
            return callback(null, false)
        }
    })
}

function auth_register(db, req, callback) {
    console.log(req.body)
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var password = req.body.password;
    db.query(`SELECT id FROM users WHERE "email" = '${email}'`, (err, res) => {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        if (res.rows.length > 0) {
            console.log('exists')
            return callback(null, false);
        }   
        else {
            bcrypt.hash(password, 10, (err, hash) => {
                db.query(`INSERT INTO users (fname, lname, email, password) VALUES ('${fname}', '${lname}', '${email}', '${hash}') RETURNING id`, (err, res) => {
                    if (err) {
                        console.log(err);
                        return callback(err, null)
                    }
                    else {
                        callback(null, {id: res.rows[0].id, email: email})
                    }
                })
            })
        }
    })
}

exports.login = auth_login;
exports.register = auth_register;