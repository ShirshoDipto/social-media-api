const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const db = require("./db");

const mongoDbUri = process.env.MONGODB_URI;

const store = new MongoDBStore({
  uri: mongoDbUri,
  collection: "sessions",
  connection: db,
});

store.on("error", (error) => {
  console.error("Session store error:", error);
});

module.exports = store;
