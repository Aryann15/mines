import React, { useState } from "react";

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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Mines
        </h1>
        <div className="grid grid-cols-5 gap-3">
          {Array(25)
            .fill(0)
            .map((value, index) => {
              const isClicked = clicks.includes(index);
              const isBomb = bombs.includes(index);
              return (
                <div
                  onClick={() => {
                    setClicks([...clicks, index]);
                    console.log(clicks);
                  }}
                  key={index}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white flex justify-center items-center rounded-lg w-16 h-16 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <p className="text-2xl font-bold">
                    {buttons ? (isBomb ? "B" : "S") : "*"}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default App;
