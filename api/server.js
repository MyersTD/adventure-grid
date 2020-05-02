const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const Pool = require('pg').Pool
const CONFIG = require('./config/config.json')
var methodOverride = require('method-override')
var cors = require('cors');

const db = new Pool({
  user: CONFIG.user,
  host: CONFIG.host,
  database: CONFIG.database,
  password: CONFIG.password,
  port: CONFIG.port,
})

app.use(bodyParser.json())
app.use(cors({credentials: true, origin: '*'}))
app.use(methodOverride());


require('./routes')(app, db)

app.listen(port, () => {
    console.log(`API listening on port ${port}.`);
})
