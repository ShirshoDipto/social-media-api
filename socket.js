const { Server } = require("socket.io");
const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();
const { v4: uuidv4 } = require("uuid");

exports.createSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
    },
  });

  const users = {};

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error("User id must be provided."));
    }

    socket.userId = userId;
    if (!users[`${userId}`]) {
      users[`${userId}`] = {
        userId: userId,
        socketId: socket.id,
      };
    }
    next();
  });

  io.on("connection", (socket) => {
    console.log(`${socket.userId} connected...`);

    socket.on("sendMsg", ({ receiverId, msg }) => {
      const receiver = users[receiverId];
      if (receiver) {
        io.to(receiver.socketId).emit("getMsg", msg);
      }
    });

    socket.on("disconnect", () => {
      console.log(`${socket.userId} disconnected...`);
      delete users[socket.userId];
    });
  });
};
