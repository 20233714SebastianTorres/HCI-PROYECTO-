import { useEffect, useState } from "react";
import socket from "../socket/socket";

function Participants() {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    socket.on("participants-update", (users) => {
      setParticipants(users);
    });

    return () => {
      socket.off("participants-update");
    };
  }, []);

  return (
    <div className="box">
      <h2>Participantes</h2>

      <ul>
        {participants.map((user) => (
          <li key={user.id}>
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Participants;