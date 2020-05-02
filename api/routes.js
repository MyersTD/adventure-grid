const auth = require('./middleware/auth-helper').auth
const tokenize = require('./middleware/auth-helper').tokenize
const sessions = require('./models/sessions')

module.exports = (app, db) => {

    app.post('/api/create', (req, res) => {
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