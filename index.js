const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const usersInRoom = {};

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("typing", (data) => {
    socket.to(data.room).emit("typing", {
      user: data.user,
    });
  });

  socket.on("join room", ({ user, room }) => {
    socket.join(room);
    console.log(`${user} joined room: ${room}`);

    if (!usersInRoom[room]) usersInRoom[room] = [];
    usersInRoom[room].push({ id: socket.id, name: user });

    //send system message
    socket.to(room).emit("chat message", {
      user: "system",
      text: `${user} joined the room`,
      room: room,
    });
  });

  socket.on("chat message", (data) => {
    io.to(data.room).emit("chat message", data); // ✅ fixed here
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
