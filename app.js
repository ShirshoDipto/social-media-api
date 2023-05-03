var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const passport = require("passport");
var logger = require("morgan");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();
require("./passport");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();
app.use(
  cors({
    origin: [process.env.CLIENT_URI, process.env.SOCKET_URI], // have to change this later on
    credentials: true,
  })
);
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDbUri = process.env.MONGODB_URI;

async function connectToMongoDb() {
  await mongoose.connect(mongoDbUri, { autoIndex: false });
  console.log("Database connection successful!!");
}

connectToMongoDb().catch((err) => {
  console.log(err);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
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

app.use("/api", indexRouter);
app.use("/users", usersRouter);

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
  res.json({ error: err.message, message: "Did you check your URL?" });
});

module.exports = app;
