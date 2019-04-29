import Piece from './piece.js';


const whitepawn = require('./img/whitepawn36.png');
const blackpawn = require('./img/blackpawn36.png');
// const test = require('./img/test.png');


export default class Pawn extends Piece {
  constructor(player){
    super(player, (player === 1 ? whitepawn : blackpawn));
  }

  // isMovePossible(src, dest){
  //   return (src - 9 === dest ||
  //     src - 8 === dest ||
  //     src - 7 === dest ||
  //     src + 1 === dest ||
  //     src + 9 === dest ||
  //     src + 8 === dest ||
  //     src + 7 === dest ||
  //     src - 1 === dest);
  // }
}
