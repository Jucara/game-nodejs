import Pawn from '../pieces/pawn.js';
//import Queen from '../pieces/queen.js';


export default function initialiseChessBoard(){
  const squares = Array(64).fill(null);

  for(let i = 0; i <= 23; i++){
    if((i < 8) && (i % 2) !== 0) {
      squares[i] = new Pawn(2);
      squares[i + 39] = new Pawn(1);
    }
    else if((i >= 8 && i <= 15) && (i % 2) === 0) {
      squares[i] = new Pawn(2);
      squares[i + 41] = new Pawn(1);
    }
    else if((i > 15) && (i % 2) !== 0) {
      squares[i] = new Pawn(2);
      squares[i + 39] = new Pawn(1);
    }
  }
  console.log(squares);
  return squares;
}
