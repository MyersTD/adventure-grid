const auth = require('./middleware/auth-helper').auth
const tokenize = require('./middleware/auth-helper').tokenize
const sessions = require('./models/sessions')

module.exports = (app, db) => {
    const Line = require('./models/line')
    const Token = require('./models/token')
    const Square = require('./models/square')
    app.post('/api/create', (req, res) => {
        var s_id = req.body.s_id;
        Line.Create(s_id, db, (err, res) => {
            if (err) {
                console.log(err);
            }
            console.log(res)
        })
        Square.Create(s_id, db, (err, res) => {
            if (err) {
                console.log(err);
            }
            console.log(res)
        })
        Token.Create(s_id, db, (err, res) => {
            if (err) {
                console.log(err);
            }
            console.log(res)
        })
        sessions.create(req, db, (err, data) => {
            if (err) {
                console.log(err)
                res.sendStatus(401);
            } else {
                res.send(data);
            }
        })
    })

    app.get('/api/sessions', (req, res) => {
        sessions.all(req, db, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(401); 
            } else {
                res.send(data);
            }
        })
    })
}