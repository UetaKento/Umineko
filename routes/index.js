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

var colors = ["black", "green", "blue", "red", "yellow", "purple"];

const post_idea = function (req) {
  const idea = {
    comp_id: req.params.compId ?? -1,
    title: req.body.title,
    content: req.body.content,
    username: req.body.username,
    email: req.body.email
  };

  const spaces = ["\t", "\n", "\r", " ", "　"];
  const tags = [];
  const sec = req.body.content.split("#");
  for (let i = 1; i < sec.length; ++i) {
    if (sec[i].length) {
      for (c of spaces) {
        sec[i] = sec[i].replaceAll(c, " ");
      }
      sec[i] = sec[i].split(" ");
      if (sec[i][0].length) tags.push(sec[i][0]);
    }
  }

  pool.getConnection(function (err, connection) {
    connection.query('INSERT INTO idea_info SET ?', idea, function (err, res) {
      if (err) {
        console.log('error: ', err);
        throw err;
      }
    });
    connection.query('SELECT last_insert_id() FROM comp_info', function (err, rows, fields) {
      if (err) {
        console.log('error: ', err);
        throw err;
      }
      const id = rows[0]["last_insert_id()"];
      for (t of tags) {
        const tag_data = {
          idea_id: id,
          tag: t
        };
        connection.query('INSERT INTO tag_info SET ?', tag_data, function (err, res) {
          if (err) {
            console.log('error: ', err);
            throw err;
          }
        });
      }
    });
    connection.release();
  });
}

//通常ページ
router.get('/', function (req, res, next) {
  pool.getConnection(function (err, connection) {
    connection.query('SELECT * FROM idea_info WHERE comp_id=-1', function (err, rows, fields) {
      if (err) {
        console.log('error: ', err);
        throw err;
      }
      connection.release();
      for (let i = 0; i < rows.length; ++i) {
        rows[i]["color"] = colors[i % colors.length];
      }
      res.render('index', { ideas: rows });
    });
  });
});
router.post('/', function (req, res, next) {
  post_idea(req);
  res.redirect('/');
});
router.post('/tag_filter', function (req, res, next) {
  res.redirect('/tag_filter/' + req.body.nexttag);
});
router.get('/tag_filter/:tag', function (req, res, next) {
  pool.getConnection(function (err, connection) {
    connection.query(
      'SELECT * FROM idea_info\
      JOIN tag_info ON idea_info.idea_id = tag_info.idea_id\
      WHERE comp_id = -1 AND tag = ?;', [req.params.tag], function (err, rows, fields) {
      if (err) {
        console.log('error: ', err);
        throw err;
      }
      connection.release();
      for (let i = 0; i < rows.length; ++i) {
        rows[i]["color"] = colors[i % colors.length];
      }
      res.render('index', { ideas: rows });
    });
  });
});
router.post('/tag_filter/:tag', function (req, res, next) {
  post_idea(req);
  res.redirect('/tag_filter/' + req.params.tag);
});

//企業公募ページ
router.get('/recruit', function (req, res, next) {
  pool.getConnection(function (err, connection) {
    connection.query('SELECT * FROM comp_info', function (err, rows, fields) {
      if (err) {
        console.log('error: ', err);
        throw err;
      }
      connection.release();
      for (let i = 0; i < rows.length; ++i) {
        rows[i]["color"] = colors[i % colors.length];
      }
      res.render('recruit', { comps: rows });
    });
  });
});
router.post('/post_to_comp/:compId', function (req, res, next) {
  post_idea(req);
  res.redirect("/recruit");
});

//企業用お題投稿ページ
router.get('/post_theme', function (req, res, next) {
  res.render('post_theme');
});
router.post('/post_theme', function (req, res, next) {
  const theme = {
    title: req.body.title,
    content: req.body.content,
    company: req.body.company,
    email: req.body.email
  };

  pool.getConnection(function (err, connection) {
    connection.query('INSERT INTO comp_info SET ?', theme, function (err, res) {
      if (err) {
        console.log('error: ', err);
        throw err;
      }
      connection.release();
    });
  });
  res.redirect('/recruit');
});

module.exports = router;
