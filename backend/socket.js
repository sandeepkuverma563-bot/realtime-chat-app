const { Server } = require("socket.io");

let io;

const userSocketMap = {};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    console.log("User Connected:", socket.id);

    socket.on("typing", ({ receiverId, senderId }) => {
      const receiverSocketId = userSocketMap[receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", {
          senderId,
        });
      }
    });

    socket.on("disconnect", () => {
      delete userSocketMap[userId];

      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      console.log("User Disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }

  return io;
};

const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

module.exports = {
  initSocket,
  getIO,
  getReceiverSocketId,
};
