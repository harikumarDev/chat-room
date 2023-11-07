const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const db = require("./config/db");
const routes = require("./routes");
const { addMessage, updateRoomMessages } = require("./controllers/utils");

db.connect();
app.use("/api", routes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("User connected (socket-id): ", socket.id);

  socket.on("join_room", async (data) => {
    const { userId, roomName } = data;

    socket.join(roomName);
    console.log("User joined room: ", roomName);

    // As soon as user joins a room, update rooms messages as read
    await updateRoomMessages(userId, roomName);
  });

  socket.on("send_message", async (data) => {
    console.log("User sent message: ", data);
    const { sender, room } = data;

    socket.to(room.name).emit("receive_message", data);

    // Save message to database and update room's messages for sender
    await addMessage(data);
    await updateRoomMessages(sender._id, room.name, 1);

    // Notify other users for new unread messages
    socket.broadcast.emit("notify_room", {
      room: room.name,
    });
  });

  socket.on("leave_room", async (data) => {
    const { userId, room } = data;

    socket.leave(room.name);
    console.log("User left room: ", room.name);

    // Update room's new messages as read when user leaves the room
    await updateRoomMessages(userId, room.name);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected (socket-id): ", socket.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}.`);
});
