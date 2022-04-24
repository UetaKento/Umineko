const router = require("express").Router();
const passport = require("passport"); 
const LocalStrategy = require("passport-local").Strategy;
require('dotenv').config();
var mysql = require('mysql');

var pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

var express = require('express');

passport.use("mylogin",
  new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
  },(username,password,done) => {
    var crypto = require('crypto');
    var sha512 = crypto.createHash('sha512');
    sha512.update(password);
    var hash = sha512.digest('hex');
    var pass;
    pool.getConnection(function (err, connection) {
      connection.query('SELECT * FROM account_info WHERE email = ?', username, function (err, rows, fields) {
        if (err) {
          console.log('error: ', err);
          throw err;
        }
        connection.release();
        pass = rows[0]["hashed_pass"];
        console.log(pass);
        if(hash===pass){
          return done(null,username);
        }
        return done(null,false);
      });
    });
  })
);


router.use(passport.initialize());

router.get("/login",(req,res) => {

  res.render("./login.ejs");
});

// ★★追加★★
// 5. どのルーティングにログイン処理を入れるか宣言
// /loginにpostリクエストがあった場合は、上で作成した"mylogin"というログイン処理をする
// ログインに成功したら"/ok"へ、失敗したら"/login"にリダイレクトする
router.post("/login",passport.authenticate(
  "mylogin",
  {
    successRedirect: "/post_theme",
    failureRedirect: "/login",
    session: false // セッションにログイン情報を保存しない。trueとすると、passport.serializeUserやpassport.deserializeUserというメソッドを実装する事でセッションに保存したログイン情報が正しいか判別出来る。
  }
));

router.get("/post_theme",(req,res) => {
  res.render("./post_theme.ejs");
});

router.get("/signup",(req,res) => {
  res.render("./signup.ejs");
});


module.exports = router;