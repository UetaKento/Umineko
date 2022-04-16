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
  res.render('index', { title: 'Home' });
});
router.get('/post', function (req, res, next) {
  res.render('post_idea', { title: 'Post' });
});
router.post('/post', function (req, res, next) {
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
  res.redirect('/post');
});

module.exports = router;
