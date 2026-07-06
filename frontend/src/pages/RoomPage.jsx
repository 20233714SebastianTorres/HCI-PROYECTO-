import "./../styles/RoomPage.css";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import socket from "../socket/socket";

import Whiteboard from "../components/Whiteboard";
import Chat from "../components/Chat";
import Flashcards from "../components/Flashcards";
import Participants from "../components/Participants";
import Pomodoro from "../components/Pomodoro";

function RoomPage() {
  const { roomId } = useParams();

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.emit("join-room", {
      roomId,
      username: localStorage.getItem("username") || "Invitado",
    });
  }, [roomId]);

  return (
    <div className="room-container">

      <div className="room-header">
        <h1>Plataforma de Estudio</h1>
        <div>
          <h3>Sala: {roomId}</h3>
          <Pomodoro />
        </div>
      </div>

      <div className="main-grid">
        <Whiteboard roomId={roomId} />
        <Chat roomId={roomId} />
      </div>

      <div className="bottom-grid">
        <Flashcards roomId={roomId} />
        <Participants roomId={roomId} />
      </div>

    </div>
  );
}

export default RoomPage;