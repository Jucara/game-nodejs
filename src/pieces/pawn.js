import Piece from './piece.js';


const whitepawn = require('./img/whitepawn40.png');
const blackpawn = require('./img/blackpawn40.png');



export default class Pawn extends Piece {
  constructor(player){
    super(player, (player === 1 ? whitepawn : blackpawn));
  }

   // isMovePossible(src, dest,occuped){
   //   if (this.player === 1){
   //     if(())
   //   }
   //
   // }
}
