const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HCI Backend running 🚀");
});

app.get("/healthz", (req, res) => {
  res.status(200).send("ok");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// =========================
// DATA
// =========================

const rooms = {};
const roomTimers = {};
const roomFlashcards = {};
const roomDrawings = {}; // 🔥 WHITEBOARD STORAGE

// =========================
// SOCKET
// =========================

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // JOIN ROOM
  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = [];
    if (!roomFlashcards[roomId]) roomFlashcards[roomId] = [];
    if (!roomDrawings[roomId]) roomDrawings[roomId] = [];

    rooms[roomId] = rooms[roomId].filter(
      (u) => u.id !== socket.id
    );

    rooms[roomId].push({
      id: socket.id,
      username,
    });

    io.to(roomId).emit("participants-update", rooms[roomId]);

    // FLASHCARDS INIT
    socket.emit("flashcards-update", roomFlashcards[roomId]);

    // 🔥 SEND WHITEBOARD HISTORY
    socket.emit("whiteboard-history", roomDrawings[roomId]);
  });

  // CHAT
  socket.on("send-message", (data) => {
    io.to(data.roomId).emit("receive-message", data);
  });

  // FLASHCARDS
  socket.on("add-flashcard", (data) => {
    const { roomId, card } = data;

    if (!roomFlashcards[roomId]) roomFlashcards[roomId] = [];

    roomFlashcards[roomId].push(card);

    io.to(roomId).emit("flashcards-update", roomFlashcards[roomId]);
  });

  // POMODORO
  socket.on("start-pomodoro", (roomId) => {
    if (roomTimers[roomId]) return;

    let timeLeft = 25 * 60;

    io.to(roomId).emit("pomodoro-update", timeLeft);

    roomTimers[roomId] = setInterval(() => {
      timeLeft--;

      io.to(roomId).emit("pomodoro-update", timeLeft);

      if (timeLeft <= 0) {
        clearInterval(roomTimers[roomId]);
        delete roomTimers[roomId];
      }
    }, 1000);
  });

  // =========================
  // WHITEBOARD (PERSISTENTE)
  // =========================

  socket.on("draw-start", (data) => {
    const { roomId } = data;

    if (!roomDrawings[roomId]) roomDrawings[roomId] = [];

    roomDrawings[roomId].push({
      type: "start",
      x: data.x,
      y: data.y,
    });

    socket.to(roomId).emit("draw-start", data);
  });

  socket.on("draw-move", (data) => {
    const { roomId } = data;

    if (!roomDrawings[roomId]) roomDrawings[roomId] = [];

    roomDrawings[roomId].push({
      type: "move",
      x: data.x,
      y: data.y,
    });

    socket.to(roomId).emit("draw-move", data);
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(
        (u) => u.id !== socket.id
      );

      io.to(roomId).emit("participants-update", rooms[roomId]);
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log("server running on", PORT);
});