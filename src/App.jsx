import React from "react";

function App() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Mines</h1>
        <div className="grid grid-cols-5 gap-3">
          {Array(25).fill(0).map((value, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white flex justify-center items-center rounded-lg w-16 h-16 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <p className="text-2xl font-bold"> </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;