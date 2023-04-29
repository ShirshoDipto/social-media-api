const { Server } = require("socket.io");

exports.createSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected...");

    socket.on("disconnect", () => {
      console.log("a user disconnected...");
    });

    socket.on("new msg", (msg) => {
      console.log(msg);
      // socket.emit();
    });
  });
};
