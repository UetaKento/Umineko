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



router.post('/signup', function (req, res, next) {
    var crypto = require('crypto');
    const email = req.body.email;
    const password = req.body.password;
    var sha512 = crypto.createHash('sha512');
    sha512.update(password);
    var hash = sha512.digest('hex');
    const values = { email: email, hashed_pass: hash };
    pool.getConnection(function (err, connection) {
      connection.query('INSERT INTO account_info SET ?', values, function (err, res) {
        if (err) {
          console.log('error: ', err);
          throw err;
        }
        connection.release();
      });
    });
    res.redirect('/login');
  });

  module.exports = router;