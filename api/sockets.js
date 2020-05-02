var io = require('socket.io'), http = require('http')
const redis = require('redis');
const client = redis.createClient();

const Pool = require('pg').Pool
const CONFIG = require('./config/config.json')

const db = new Pool({
  user: CONFIG.user,
  host: CONFIG.host,
  database: CONFIG.database,
  password: CONFIG.password,
  port: CONFIG.port,
})



server = http.createServer()

io = io.listen(server);

io.on('connection', onConnect);

function onConnect(socket) {
  console.log('User Connected');
    
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
      }
  )
  })

  socket.on('publish', function(data) {
    db.query(
      `UPDATE sessions
      SET history = '${data.history}'
      WHERE sessionid = ${data.room}`,
      (err, res) => {
          if (err) { 
              console.log(err);
              io.to(data.room).emit('published art', null);
          }
          else {
              io.to(data.room).emit('published art', data.history);
          }
      }
    )
  })

  

  socket.on('get last art', function(s_id) {
    db.query(
      `SELECT history 
      FROM sessions
      WHERE sessionid = ${s_id}`,
      (err, res) => {
          if (err) {
              console.log(err);
              io.to(s_id).emit('published art', null);
          }
          else {
            if (res.rows[0]) {
              io.to(s_id).emit('published art', res.rows[0].history);
            } else {
              io.to(s_id).emit('published art', null);
            }
          }
      }
    )
  })
}

server.listen(3001, function(){
console.log('Server started on 3001');

});