const auth = require('./middleware/auth-helper').auth
const tokenize = require('./middleware/auth-helper').tokenize
const sessions = require('./models/sessions')

module.exports = (app, db) => {

    app.post('/api/create', (req, res) => {
        sessions.create(req, db, (err, res) => {
            if (err) {
                res.sendStatus(401);
            } else {
                res.send(res);
            }
        })
    })

    app.post('/api/save', (req, res) => {
        sessions.save(req, db, (err, res) => {
            if (err) {
                res.sendStatus(401);
            } else {
                res.send(res);
            }
        })
    })

    app.get('/api/history', (req, res) => {
        sessions.history(req, db, (err, res) => {
            if (err) {
                res.sendStatus(401);
            } else {
                res.send(res);
            }
        })
    })
}