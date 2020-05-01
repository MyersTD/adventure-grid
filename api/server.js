const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const Pool = require('pg').Pool

const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'adventure-grid',
  password: 'sgs335W!7',
  port: 5432,
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