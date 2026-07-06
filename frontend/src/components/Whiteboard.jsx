import { useRef, useEffect } from "react";
import socket from "../socket/socket";

function Whiteboard({ roomId }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  // =========================
  // SOCKET LISTENERS
  // =========================

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    const handleDrawStart = (data) => {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    };

    const handleDrawMove = (data) => {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    };

    socket.on("draw-start", handleDrawStart);
    socket.on("draw-move", handleDrawMove);

    return () => {
      socket.off("draw-start", handleDrawStart);
      socket.off("draw-move", handleDrawMove);
    };
  }, []);

  // =========================
  // POSICIÓN DEL MOUSE
  // =========================

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // =========================
  // DRAW EVENTS
  // =========================

  const start = (e) => {
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");

    drawingRef.current = true;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    socket.emit("draw-start", {
      roomId,
      x: pos.x,
      y: pos.y,
    });
  };

  const move = (e) => {
    if (!drawingRef.current) return;

    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    socket.emit("draw-move", {
      roomId,
      x: pos.x,
      y: pos.y,
    });
  };

  const stop = () => {
    drawingRef.current = false;
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="whiteboard-container">
      <h2>Pizarra colaborativa</h2>

      <canvas
        ref={canvasRef}
        width={700}
        height={350}
        style={{
          width: "100%",
          height: "350px",
          background: "white",
          border: "1px solid #ddd",
        }}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={stop}
        onMouseLeave={stop}
      />
    </div>
  );
}

export default Whiteboard;