module.exports = (db) => {
    const Pool = require('pg').Pool
    const CONFIG = require('./config/config.json')

    var io = require('socket.io'), http = require('http')
    const Line = require('./models/line')
    const Token = require('./models/token')
    const Square = require('./models/square')

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
            //console.log(data)
            switch (data.id) {
                case 'square':
                    Square.Save(data, db, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    break;
                case 'line':
                    Line.Save(data, db, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    })
                    break;
                case 'token':
                    Token.Save(data, db, (err) => {
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
                    Square.Load(data, db, (history) => {
                        if (history) {
                            let newData = {history: history, id: data.id}
                            io.to(data.room).emit('sync all set', newData);
                        } 
                    });
                    break;
                case 'line':
                    Line.Load(data, db, (history) => {
                        if (history) {
                            let newData = {history: history, id: data.id}
                            io.to(data.room).emit('sync all set', newData);
                        } 
                    });
                    break;
                case 'token':
                    Token.Load(data, db, (history) => {
                        if (history) {
                            let newData = {history: history, id: data.id}
                            io.to(data.room).emit('sync all set', newData);
                        } 
                    })
            }
        })
    }
    
    server.listen(3001, function(){
        console.log('Sockets open on 3001');
    });
}