let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

http.listen(4000, function(){
  console.log('listening on: 4000')
});

let board = new Array(8);

for(let i = 0; i < 8; i++){
  board[i] = new Array(8);
  for(let j = 0; j < 8; j++){
    if (i < 3) {
      if (((i + j) % 2) == 0)
        board[i][j] = 'black pawn';
    }
    else if (i > 4) {
      if (((i + j) % 2) == 0)
        board[i][j] = 'white pawn';
    }
    else {
      board[i][j] = '';
    }
  }
}

function possibleMoves(row, column, color, isQueen) {

  let legalMove = [];

  let moveUpperLeft = colNames[column - 1] + (row);
  let moveUpperRight = colNames[column + 1] + (row);
  let moveLowerLeft = colNames[column - 1] + (row + 2);
  let moveLowerRight = colNames[column + 1] + (row + 2);

  if(((column > 0) && (row < 7) && (board[row + 1][column - 1] === '' ) && (color === 'black' || isQueen)) || ((color === 'black' || isQueen) && (column > 1) && (row < 6) && (board[column - 1][row + 1] === 'white pawn') &&   (board[column - 2][row + 2] === ''))){
    if(board[row + 1][column - 1] === '')
      legalMove.push(moveLowerLeft);

    else
      legalMove.push(colNames[column - 2] + (row + 3));
  }

  if(((column < 7) && (row < 7) && (board[row + 1][column + 1] === '' ) && (color === 'black' || isQueen)) || ((color === 'black' || isQueen) && (column < 6) && (row < 6) && (board[column + 1][row + 1] === 'white pawn') &&   (board[column + 2][row + 2] === ''))){
    if(board[row + 1][column + 1] === '')
      legalMove.push(moveLowerRight);

    else
      legalMove.push(colNames[column + 2] + (row + 3));
  }

  if(((column > 0) && (row > 0) && (board[row - 1][column - 1] === '' ) && (color === 'white' || isQueen)) || ((color === 'white' || isQueen) && (column > 1) && (row > 1) && (board[column - 1][row - 1] === 'black pawn') &&   (board[column - 2][row - 2] === ''))){
    if(board[row - 1][column - 1] === '')
      legalMove.push(moveUpperLeft);

    else
      legalMove.push(colNames[column - 2] + (row - 1));
  }

  if(((column < 7) && (row > 0) && (board[row - 1][column + 1] === '' ) && (color === 'white' || isQueen)) || ((color === 'white' || isQueen) && (column < 6) && (row > 1) && (board[column + 1][row - 1] === 'black pawn') &&   (board[column + 2][row - 2] === ''))){
    if(board[row - 1][column + 1] === '')
      legalMove.push(moveUpperRight);

    else
      legalMove.push(colNames[column + 2] + (row - 1));
  }
  return legalMove;
}

const colNames= ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
let players = 'white';

io.on('connection', function(socket){
  console.log('Client connected');
  // console.table(board);
  // if (players.length >= 2 )
  //   return;
  // players.push(socket);
  socket.on('move', function(data){
    let legalMoves = [];
    let column = colNames.indexOf(data.substring(0, 1))
    let row = data.substring(1, 2) - 1;
    if (players == 'white') {
      
      if(board[row][column] == 'white pawn') {
        legalMoves = possibleMoves(row, column, 'white', false);
        if (legalMoves.indexOf(data.substring(2, 4)) !== -1) {
          console.log('le move est possible')
          players = 'black';
        }
        else {
          console.log('stop trolling u beginner')
        }
      } 
      
    }
    else {
      if(board[row][column] == 'black pawn') {
        legalMoves = possibleMoves(row, column, 'black', false);
        if (legalMoves.indexOf(data.substring(2, 4)) !== -1) {
          console.log('le move est possible')
          players = 'white';
        } else {
          console.log('stop trolling u beginner')
        }
      }
    }
    console.log(legalMoves)
  })
  // socket.on("Press button", function(data){
  //   console.log('Received button press', data)
  //   if (players.indexOf(socket) == turn){
  //     socket.emit('message', 'Nice, you played a turn');
  //     turn = (turn+1)%2
  //   } else {
  //     socket.emit('message', "It's not your turn, fool!");
  //   }
  // })
})

// let players = [];
// let turn = 0;

