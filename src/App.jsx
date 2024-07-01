import React, { useState, useEffect } from "react";

function getBombs() {
  let numbers = [];
  while (numbers.length < 5) {
    let random = Math.floor(Math.random() * 25);
    if (!numbers.includes(random)) {
      numbers.push(random);
    }
  }
  return numbers;
}

function App() {
  const [clicks, setClicks] = useState([]);
  const [bombs, setBombs] = useState(getBombs());
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (clicks.some(click => bombs.includes(click))) {
      setGameOver(true);
    }
  }, [clicks, bombs]);

  const handleClick = (index) => {
    if (!gameOver && !clicks.includes(index)) {
      setClicks([...clicks, index]);
    }
  };

  const resetGame = () => {
    setClicks([]);
    setBombs(getBombs());
    setGameOver(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-indigo-800">
          Mines
        </h1>
        <div className="grid grid-cols-5 gap-3 mb-6">
          {Array(25).fill(0).map((_, index) => {
            const isClicked = clicks.includes(index);
            const isBomb = bombs.includes(index);
            return (
              <div
                onClick={() => handleClick(index)}
                key={index}
                className={`
                  flex justify-center items-center rounded-lg w-16 h-16 
                  shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer
                  ${isClicked 
                    ? isBomb
                      ? 'bg-red-500 text-white'
                      : 'bg-green-400 text-indigo-800'
                    : 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white'
                  }
                `}
              >
                <p className="text-2xl font-bold">
                  {isClicked ? (isBomb ? "💣" : "✓") : ""}
                </p>
              </div>
            );
          })}
        </div>
        {gameOver && (
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 mb-4">Game Over!</p>
            <button 
              onClick={resetGame}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;