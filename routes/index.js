require('dotenv').config();

var mysql = require('mysql');
var pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  pool.getConnection(function (err, connection) {
    connection.query('SELECT * FROM idea_info', function (err, rows, fields) {
      if (err) {
        console.log('error: ', err);
        throw err;
      }
      connection.release();
      console.log(rows);
      res.render('index', { ideas: rows });
    });
  });
});
router.post('/', function (req, res, next) {
  const idea = {
    comp_id: -1,
    title: req.body.title,
    content: req.body.content,
    username: req.body.username,
    email: req.body.email
  };

  pool.getConnection(function (err, connection) {
    connection.query('INSERT INTO idea_info SET ?', idea, function (err, res) {
      if (err) {
        console.log('error: ', err);
        throw err;
      }
      connection.release();
    });
  });
  res.redirect('/');
});

module.exports = router;
