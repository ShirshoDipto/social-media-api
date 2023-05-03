const { Server } = require("socket.io");
const User = require("./models/user");
const Conversation = require("./models/conversation");
const Message = require("./models/message");
const Notification = require("./models/notification");

const root = "http://localhost:5000";

async function createMsg(sender) {
  const res = await fetch(`${root}/api/messenger/messeges/`);
}

async function createNotification() {
  console.log("Creating...");
}

async function updateConversation() {
  console.log("Updating...");
}

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
        currentChat: null,
        isOnMessenger: false,
      };
    }
    next();
  });

  io.on("connection", async (socket) => {
    console.log(`${socket.userId} connected...`);

    socket.on("sendMsg", async ({ receiverId, msg }) => {
      const receiver = users[receiverId];
      try {
        if (receiver && receiver.currentChat) {
          io.to(receiver.socketId).emit("getMsg", msg);
        } else if (
          receiver &&
          receiver.isOnMessenger &&
          !receiver.currentChat
        ) {
          const [msg, conv] = await Promise.all([
            createMsg(),
            updateConversation(),
          ]);

          io.to(receiver.socketId).emit("getMsg", msg);
        } else if ((receiver && !receiver.isOnMessenger) || !receiver) {
          const [msg, conv, notif] = await Promise.all([
            createMsg(),
            updateConversation(),
            createNotification(),
          ]);

          io.to(receiver.socketId).emit("newMsg", notif);
        }
      } catch (error) {
        socket.emit("internalError", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`${socket.userId} disconnected...`);
      delete users[socket.userId];
    });
  });
};
