import React, { useState, useEffect, useCallback } from "react";

function App() {
  const [clicks, setClicks] = useState([]);
  const [bombs, setBombs] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [currentTurn, setCurrentTurn] = useState("");
  const [players, setPlayers] = useState({});

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080/ws");
    
    newSocket.onopen = () => {
      console.log("WebSocket connected");
    };

    newSocket.onmessage = (event) => {
      console.log("Received message:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === "gameState") {
          setBombs(data.bombs);
          setClicks(data.clicks);
          setPlayers(data.players);
          setCurrentTurn(data.turn);
        } else if (data.type === "error") {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onclose = (event) => {
      console.log("WebSocket closed:", event);
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN && roomId && playerId) {
      socket.send(JSON.stringify({ type: "join", roomId, playerId }));
    }
  }, [socket, roomId, playerId]);

  const handleClick = useCallback((index) => {
    if (!gameOver && !clicks.includes(index) && socket && socket.readyState === WebSocket.OPEN && currentTurn === playerId) {
      socket.send(JSON.stringify({ type: "click", roomId, playerId, index }));
    }
  }, [gameOver, clicks, socket, roomId, playerId, currentTurn]);

  const resetGame = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "newGame", roomId }));
    }
    setGameOver(false);
  }, [socket, roomId]);

  useEffect(() => {
    if (clicks.some(click => bombs.includes(click))) {
      setGameOver(true);
    }
  }, [clicks, bombs]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-indigo-800">
          Multiplayer Mines
        </h1>
        <div className="mb-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Room ID"
            className="mr-2 p-2 border rounded"
          />
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Player ID"
            className="mr-2 p-2 border rounded"
          />
          <button
            onClick={joinRoom}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Join Room
          </button>
        </div>
        <div className="mb-4">
          Current Turn: {currentTurn}
        </div>
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