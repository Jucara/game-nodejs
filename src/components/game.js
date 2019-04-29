import React from 'react';
import '../index.css';
import Board from './board.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';

export default class Game extends React.Component {
  constructor(){
    super();
    this.state = {
      squares: initialiseChessBoard(),
      player: 1,
      sourceSelection: -1,
      status: '',
      turn: 'white'
    }
  }


  render() {
    console.log(this.state.squares);
    return (
      <div>
        <div className="game">
          <div className="game-board">
            <Board
              squares = {this.state.squares}
              onClick = {(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <h3>Turn</h3>
            <div id="player-turn-box" style={{backgroundColor: this.state.turn}}>

            </div>
            <div className="game-status">{this.state.status}</div>

            <div className="fallen-soldier-block">


            </div>

          </div>
        </div>

        
      </div>


      );
  }
}
