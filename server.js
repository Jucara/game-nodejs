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
      if (((i + j) % 2) == 0) {
        board[i][j] = 'black pawn';
        continue;
      }
    }
    else if (i > 4) {
      if (((i + j) % 2) == 0) {
        board[i][j] = 'white pawn';
        continue;
      }
    }
    board[i][j] = '';
  }
}

function possibleMoves(row, column, color, isQueen) {

  let legalMove = [];

  let moveUpperLeft = colNames[column - 1] + (row);
  let moveUpperRight = colNames[column + 1] + (row);
  let moveLowerLeft = colNames[column - 1] + (row + 2);
  let moveLowerRight = colNames[column + 1] + (row + 2);

  if(((column > 0) && (row < 7) && (board[row + 1][column - 1] === '' ) && (color === 'black' || isQueen)) || ((color === 'black' || isQueen) && (column > 1) && (row < 6) && (board[row + 1][column - 1].split(' ', 1)[0] !== color) && (board[row + 2][column - 2] === ''))){
    if(board[row + 1][column - 1] === '')
      legalMove.push(moveLowerLeft);

    else
      legalMove.push(colNames[column - 2] + (row + 3));
  }

  if(((column < 7) && (row < 7) && (board[row + 1][column + 1] === '' ) && (color === 'black' || isQueen)) || ((color === 'black' || isQueen) && (column < 6) && (row < 6) && (board[row + 1][column + 1].split(' ', 1)[0] !== color) && (board[row + 2][column + 2] === ''))){
    if(board[row + 1][column + 1] === '')
      legalMove.push(moveLowerRight);

    else
      legalMove.push(colNames[column + 2] + (row + 3));
  }

  if(((column > 0) && (row > 0) && (board[row - 1][column - 1] === '' ) && (color === 'white' || isQueen)) || ((color === 'white' || isQueen) && (column > 1) && (row > 1) && (board[row - 1][column - 1].split(' ', 1)[0] !== color) && (board[row - 2][column - 2] === ''))){
    if(board[row - 1][column - 1] === '')
      legalMove.push(moveUpperLeft);

    else
      legalMove.push(colNames[column - 2] + (row - 1));
  }

  if(((column < 7) && (row > 0) && (board[row - 1][column + 1] === '' ) && (color === 'white' || isQueen)) || ((color === 'white' || isQueen) && (column < 6) && (row > 1) && (board[row - 1][column + 1].split(' ', 1)[0] !== color) && (board[row - 2][column + 2] === ''))){
    if(board[row - 1][column + 1] === '')
      legalMove.push(moveUpperRight);

    else
      legalMove.push(colNames[column + 2] + (row - 1));
  }
  return legalMove;
}

function mandatoryMoves(row, column, color, isQueen) {

  let obligedMoves = [];

  cellLowerLeft = board[row + 1][column - 1];
  cellLowerRight = board[row + 1][column + 1];
  cellUpperLeft = board[row - 1][column - 1];
  cellUpperRight = board[row - 1][column + 1];

  if((column > 1) && (row < 6) && (color === 'black' || isQueen) && (cellLowerLeft !== '') && (cellLowerLeft.split(' ', 1)[0] !== color) && (board[row + 2][column - 2] === ''))
    obligedMoves.push(colNames[column - 2] + (row + 3));

  if((column < 6) && (row < 6) && (color === 'black' || isQueen) && (cellLowerRight !== '') && (cellLowerRight.split(' ', 1)[0] !== color) && (board[row + 2][column + 2] === ''))
    obligedMoves.push(colNames[column + 2] + (row + 3));

  if((column > 1) && (row > 1) && (color === 'white' || isQueen) && (cellUpperLeft !== '') && (cellUpperLeft.split(' ', 1)[0] !== color) && (board[row - 2][column - 2] === ''))
    obligedMoves.push(colNames[column - 2] + (row - 1));

  if((column > 1) && (row < 6) && (color === 'white' || isQueen) && (cellUpperRight !== '') && (cellUpperRight.split(' ', 1)[0] !== color) && (board[row - 2][column + 2] === ''))
    obligedMoves.push(colNames[column + 2] + (row - 1));

  return obligedMoves;
}

function gameOver(player) {
  for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
      if(board[i][j].includes(player) && possibleMoves(i, j, player, board[i][j].includes('queen')).length !== 0)
        return false;
    }
  }
  return true;
}



const colNames= ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
let players = 'white';

io.on('connection', function(socket){
  console.log('Client connected');
  socket.on('move', function(data){
    let legalMoves = [];
    let obligedMoves = [];
    let column_origin = colNames.indexOf(data.substring(0, 1));
    let row_origin = data.substring(1, 2) - 1;
    let column_dest = colNames.indexOf(data.substring(2, 3));
    let row_dest = data.substring(3, 4) - 1;
    if (players == 'white') {
      for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
          if(board[i][j].includes('white'))
            obligedMoves = mandatoryMoves(row_origin, column_origin, 'white', board[row_origin][column_origin].includes('queen'))
        }
      }
      if(board[row_origin][column_origin].includes('white') && ((obligedMoves.length === 0) || (obligedMoves.indexOf(data.substring(2, 4)) !== -1))) {
        legalMoves = possibleMoves(row_origin, column_origin, 'white', board[row_origin][column_origin].includes('queen'));
        if (legalMoves.indexOf(data.substring(2, 4)) !== -1) {
          if (Math.abs(row_origin - row_dest) > 1) {
            board[(row_origin + row_dest) / 2][(column_origin + column_dest) / 2] = '';
          }
          if(row_dest != 0)
            board[row_dest][column_dest] = board[row_origin][column_origin];
          else
            board[row_dest][column_dest] = 'white queen';
          board[row_origin][column_origin] = '';
          console.log('le move est possible');
          players = 'black';
        }
        else {
          console.log('stop trolling u poe');
        }
      } 
      
    }
    else {
      for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
          if(board[i][j].includes('black'))
          obligedMoves = mandatoryMoves(row_origin, column_origin, 'black', board[row_origin][column_origin].includes('queen'))
        }
      }
      if(board[row_origin][column_origin].includes('black') && ((obligedMoves.length === 0) || (obligedMoves.indexOf(data.substring(2, 4)) !== -1))) {
        legalMoves = possibleMoves(row_origin, column_origin, 'black', board[row_origin][column_origin].includes('queen'));
        if (legalMoves.indexOf(data.substring(2, 4)) !== -1) {
          if (Math.abs(row_origin - row_dest) > 1) {
            board[(row_origin + row_dest) / 2][(column_origin + column_dest) / 2] = '';
          }
          if(row_dest != 7)
            board[row_dest][column_dest] = board[row_origin][column_origin];
          else
            board[row_dest][column_dest] = 'black queen';
          board[row_origin][column_origin] = '';
          console.log('le move est possible');
          players = 'white';
        } else {
          console.log('stop trolling u padim');
        }
      }
    }
    if(gameOver(players) === true){
      console.log('Jamal a gagné');
    }  
    console.log("Obliged moves ", obligedMoves)
    console.log("Legal moves ", legalMoves);
    console.table(board);
  })
})

