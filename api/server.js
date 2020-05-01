const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const Pool = require('pg').Pool
const CONFIG = require('./config/config.json')

const db = new Pool({
  user: CONFIG.user,
  host: CONFIG.host,
  database: CONFIG.database,
  password: CONFIG.password,
  port: CONFIG.port,
})

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', '*');

  res.setHeader("Access-Control-Allow-Headers", "*");
      // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
})

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

require('./routes')(app, db)

app.listen(port, () => {
    console.log(`Running api server on port ${port}.`);
})
