var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const passport = require("passport");
var logger = require("morgan");
const session = require("express-session");
const sessionStore = require("./db/session");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();
require("./passport");

const homeRouter = require("./routes/home");
const userRouter = require("./routes/users");
const notificationRouter = require("./routes/notifications");
const messengerRouter = require("./routes/messenger");

const app = express();
app.use(
  cors({
    origin: [process.env.CLIENT_URI, process.env.SOCKET_URI],
    credentials: true,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // session expiration time
    },
  })
);

app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/home", homeRouter);
app.use("/api/users", userRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/messenger", messengerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;
