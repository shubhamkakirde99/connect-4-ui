import React, { MutableRefObject, useEffect, useState } from "react";
import "./ConnectFour.css"; // Make sure to create this CSS file

type GameProps = {
  socketRef: MutableRefObject<WebSocket>;
};

const ROWS = 6;
const COLS = 7;

const Game = ({ socketRef }: GameProps) => {
  const [board, setBoard] = useState<number[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [winner, setWinner] = useState<number>(0);

  useEffect(() => {
    socketRef.current.onmessage = (event: any) => {
      const data = JSON.parse(event?.data);
      console.log(`home - [message] Data received from server: ${data}`);
      if (data?.type === "game_move") {
        console.log(data);
        setBoard(data?.payload?.board);
        setCurrentPlayer(parseInt(data?.payload?.currentTurn));
        setWinner(parseInt(data?.payload?.winner));
      }
    };
  }, []);

  const handleColumnClick = (col: number) => {
    if (currentPlayer !== parseInt(localStorage.getItem("player") || "")) {
      return;
    } else if (winner > 0) {
      return;
    }
    socketRef.current.send(
      JSON.stringify({
        type: "game_move",
        payload: {
          column: col,
          player: localStorage.getItem("player"),
        },
      })
    );
  };

  return (
    <React.Fragment>
      <h1>
        {currentPlayer === parseInt(localStorage.getItem("player") || "")
          ? `Your Turn, You Play ${
              parseInt(localStorage.getItem("player") || "") === 1
                ? "Red"
                : "Green"
            }`
          : "Opponent's Turn"}
      </h1>

      <div className="connect-four">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell player-${cell}`}
                onClick={() => handleColumnClick(colIndex)}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};

export default Game;
