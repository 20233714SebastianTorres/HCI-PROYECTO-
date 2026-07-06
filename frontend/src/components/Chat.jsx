import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const { roomId } = useParams();

  const username =
    localStorage.getItem("username") || "Invitado";

  useEffect(() => {
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send-message", {
      roomId,
      username,
      message,
    });

    setMessage("");
  };

  return (
    <div className="box">
      <h2>Chat</h2>

      <div
        style={{
          height: "250px",
          overflowY: "auto",
          background: "#f8fafc",
          borderRadius: "12px",
          padding: "10px",
          marginBottom: "15px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}
          >
            <strong>{msg.username}</strong>
            <p style={{ margin: "5px 0 0 0" }}>
              {msg.message}
            </p>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe un mensaje..."
      />

      <button
        onClick={sendMessage}
        style={{ marginLeft: "10px" }}
      >
        Enviar
      </button>
    </div>
  );
}

export default Chat;