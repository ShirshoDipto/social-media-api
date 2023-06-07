const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const mongoDbUri = process.env.MONGODB_URI;

mongoose.connect(mongoDbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
});

console.log("Database connection successful...");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

module.exports = db;
