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

    // 🔥 HISTORY (cuando entras o refrescas)
    const handleHistory = (history) => {
      history.forEach((data) => {
        if (data.type === "start") {
          ctx.beginPath();
          ctx.moveTo(data.x, data.y);
        }

        if (data.type === "move") {
          ctx.lineTo(data.x, data.y);
          ctx.stroke();
        }
      });
    };

    const handleStart = (data) => {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    };

    const handleMove = (data) => {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    };

    socket.on("whiteboard-history", handleHistory);
    socket.on("draw-start", handleStart);
    socket.on("draw-move", handleMove);

    return () => {
      socket.off("whiteboard-history", handleHistory);
      socket.off("draw-start", handleStart);
      socket.off("draw-move", handleMove);
    };
  }, []);

  // =========================
  // POSICIÓN
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
  // DRAW
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