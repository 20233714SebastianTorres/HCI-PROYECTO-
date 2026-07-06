const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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
// SOCKET
// =========================

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // JOIN ROOM
  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

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

    io.to(roomId).emit(
      "pomodoro-update",
      timeLeft
    );

    roomTimers[roomId] = setInterval(() => {
      timeLeft--;

      io.to(roomId).emit(
        "pomodoro-update",
        timeLeft
      );

      if (timeLeft <= 0) {
        clearInterval(roomTimers[roomId]);
        delete roomTimers[roomId];
      }
    }, 1000);
  });

  // =========================
  // WHITEBOARD
  // =========================

  socket.on("draw-start", (data) => {
    socket.to(data.roomId).emit(
      "draw-start",
      data
    );
  });

  socket.on("draw-move", (data) => {
    socket.to(data.roomId).emit(
      "draw-move",
      data
    );
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

server.listen(3001, () => {
  console.log("server running on 3001");
});