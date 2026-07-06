import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./../styles/HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");

  const createRoom = () => {
    if (!username.trim()) {
      alert("Ingresa tu nombre");
      return;
    }

    localStorage.setItem("username", username);

    const randomCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    navigate(`/room/${randomCode}`);
  };

  const joinRoom = () => {
    if (!username.trim()) {
      alert("Ingresa tu nombre");
      return;
    }

    if (!roomCode.trim()) return;

    localStorage.setItem("username", username);

    navigate(`/room/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Plataforma de Estudio Colaborativo</h1>

        <input
          type="text"
          placeholder="Tu nombre"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />

        <input
          type="text"
          placeholder="Código de sala"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />

        <br />

        <button onClick={createRoom}>
          Crear Sala
        </button>

        <button onClick={joinRoom}>
          Unirse a Sala
        </button>
      </div>
    </div>
  );
}

export default HomePage;