import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";

function Flashcards() {
  const { roomId } = useParams();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [cards, setCards] = useState([]);

  useEffect(() => {
    socket.on("flashcards-update", (updatedCards) => {
      setCards(updatedCards);
    });

    return () => {
      socket.off("flashcards-update");
    };
  }, []);

  const addCard = () => {
    if (!question.trim() || !answer.trim()) return;

    socket.emit("add-flashcard", {
      roomId,
      card: {
        question,
        answer,
        showAnswer: false,
      },
    });

    setQuestion("");
    setAnswer("");
  };

  const toggleAnswer = (index) => {
    const updatedCards = [...cards];

    updatedCards[index].showAnswer =
      !updatedCards[index].showAnswer;

    setCards(updatedCards);
  };

  return (
    <div className="box">
      <h2>Flashcards</h2>

      <input
        type="text"
        placeholder="Pregunta"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Respuesta"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <br />
      <br />

      <button onClick={addCard}>
        Agregar Flashcard
      </button>

      <hr />

      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            background: "#f8fafc",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>Pregunta:</strong>

          <p>{card.question}</p>

          <button
            onClick={() => toggleAnswer(index)}
          >
            {card.showAnswer
              ? "Ocultar respuesta"
              : "Mostrar respuesta"}
          </button>

          {card.showAnswer && (
            <>
              <p>
                <strong>Respuesta:</strong>
              </p>

              <p>{card.answer}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default Flashcards;