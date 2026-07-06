const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

// =========================
// MIDDLEWARE
// =========================

// Puedes ajustar origins si tienes frontend deployado
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// =========================
// BASIC ROUTES (IMPORTANTE PARA RENDER)
// =========================

// Evita "Cannot GET /"
app.get("/", (req, res) => {
  res.send("HCI Backend running 🚀");
});

// Health check (RENDER LO USA)
app.get("/healthz", (req, res) => {
  res.status(200).send("ok");
});

// =========================
// SERVER
// =========================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // producción demo (puedes restringir después)
    methods: ["GET", "POST"],
  },
});

// =========================
// DATA
// =========================

const rooms = {};
const roomTimers = {};
const roomFlashcards = {};

// =========================
// SOCKET LOGIC
// =========================

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // JOIN ROOM
  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = [];

    rooms[roomId] = rooms[roomId].filter(
      (u) => u.id !== socket.id
    );

    rooms[roomId].push({
      id: socket.id,
      username,
    });

    io.to(roomId).emit(
      "participants-update",
      rooms[roomId]
    );

    if (!roomFlashcards[roomId]) {
      roomFlashcards[roomId] = [];
    }

    socket.emit(
      "flashcards-update",
      roomFlashcards[roomId]
    );
  });

  // CHAT
  socket.on("send-message", (data) => {
    io.to(data.roomId).emit(
      "receive-message",
      data
    );
  });

  // FLASHCARDS
  socket.on("add-flashcard", (data) => {
    const { roomId, card } = data;

    if (!roomFlashcards[roomId]) {
      roomFlashcards[roomId] = [];
    }

    roomFlashcards[roomId].push(card);

    io.to(roomId).emit(
      "flashcards-update",
      roomFlashcards[roomId]
    );
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

  // WHITEBOARD
  socket.on("draw-start", (data) => {
    socket.to(data.roomId).emit("draw-start", data);
  });

  socket.on("draw-move", (data) => {
    socket.to(data.roomId).emit("draw-move", data);
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(
        (u) => u.id !== socket.id
      );

      io.to(roomId).emit(
        "participants-update",
        rooms[roomId]
      );
    }
  });
});

// =========================
// PORT (IMPORTANTE EN RENDER)
// =========================

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log("server running on", PORT);
});