const router = require("express").Router();
const passport = require("passport"); 
const LocalStrategy = require("passport-local").Strategy;

passport.use("mylogin",
  new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
  },(username,password,done) => {

    if(username==="user" && password==="password"){
      return done(null,username);
    }

    return done(null,false);
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