import React, { useState } from 'react';
import Board from './Board';

function Game() {
  return (
    <div className="game">
      <h1>Minesweeper</h1>
      <Board />
    </div>
  );
}

export default Game;