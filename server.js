var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require ('path');
var port = process.env.PORT || 8000; // connection heroku

/**
 * variables globales
 */
let roomArray=[];
let usersList = [];
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
let colNames= ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
let turn = 'white';
let plusieurs_prises = [];
/*
* fonctions jeu des dames----------------------------------
*-----------------------------------------------------------
*/
function verifpiece(data) {
  let column_origin = colNames.indexOf(data.playerMove.substring(0, 1));
  let row_origin = data.playerMove.substring(1, 2) - 1;
  if((data.playerNumber && board[row_origin][column_origin].includes('white')) || (!data.playerNumber && board[row_origin][column_origin].includes('black')))
    return true;
  return false;
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

  if((column > 1) && (row < 6) && (color === 'black' || isQueen) && (board[row + 1][column - 1] !== '') && (board[row + 1][column - 1].split(' ', 1)[0] !== color) && (board[row + 2][column - 2] === ''))
    obligedMoves.push(colNames[column - 2] + (row + 3));

  if((column < 6) && (row < 6) && (color === 'black' || isQueen) && (board[row + 1][column + 1] !== '') && (board[row + 1][column + 1].split(' ', 1)[0] !== color) && (board[row + 2][column + 2] === ''))
    obligedMoves.push(colNames[column + 2] + (row + 3));

  if((column > 1) && (row > 1) && (color === 'white' || isQueen) && (board[row - 1][column - 1] !== '') && (board[row - 1][column - 1].split(' ', 1)[0] !== color) && (board[row - 2][column - 2] === ''))
    obligedMoves.push(colNames[column - 2] + (row - 1));

  if((column < 6) && (row > 1) && (color === 'white' || isQueen) && (board[row - 1][column + 1] !== '') && (board[row - 1][column + 1].split(' ', 1)[0] !== color) && (board[row - 2][column + 2] === ''))
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


app.use(express.static(path.join(__dirname, 'public')));
 app.get('/', function(req, res){
  res.sendFile(__dirname + '/socket-client/public/index.html');
});

 io.on('connection', function (socket) {
 
  var loggedUser; // Utilisateur connecté a la socket
  let roomID;
  let playerNumber = false;  
  /**
   * Connexion d'un utilisateur via le formulaire :
   *  - sauvegarde du user
   */
   socket.on('user-login', function (user) {
    loggedUser = user;

   
    socket.emit('login', {userName: loggedUser.username});
    var message = {message: loggedUser.username + " joined the room"}
    
    socket.to(roomID).broadcast.emit('chat-message', message);
    
   
    io.emit('room-list', roomArray.map(r => r.id));
  });
   /**
   * Réception de l'événement 'room-service' et 'move' 
   * et réémission vers tous les utilisateurs connectés à la room
   */
   socket.on('createRoom', function(data){
    socket.leave(roomID); // on quitte une room
    roomID = data.roomName; // nom de la room
    
    socket.join(roomID);
    let room ={
      id:roomID,
      player1: data.user,
      player2:''
    }
    if(roomArray.indexOf(roomID) === -1){roomArray.push(room)}; // compte le nombre de joueurs à la room
    playerNumber =true;
    
    socket.emit('room-service', [room.id, room.player1, room.player2]);
    
    socket.emit('playerNumber', playerNumber);
   
    io.emit('room-list', roomArray.map(r => r.id));
 

    // jeu de dame -> mouvement
    socket.on('move', function(data){
      
      if (turn == 'white') {
        
        let column_origin = colNames.indexOf(data.playerMove.substring(0, 1));
        let row_origin = data.playerMove.substring(1, 2) - 1;
        
        if(verifpiece(data)){
          let column_dest = colNames.indexOf(data.playerMove.substring(2, 3));
          let row_dest = data.playerMove.substring(3, 4) - 1;
          let obligedMoves = [];

          for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
              if(board[i][j].includes('white'))
                obligedMoves = mandatoryMoves(row_origin, column_origin, 'white', board[row_origin][column_origin].includes('queen'))
            }
          }
         
          if((obligedMoves.length === 0) || (obligedMoves.indexOf(data.playerMove.substring(2, 4)) !== -1) && ((plusieurs_prises.length === 0) || (plusieurs_prises.indexOf(data.playerMove) !== -1))) {
            plusieurs_prises = [];
            
            if(possibleMoves(row_origin, column_origin, 'white', board[row_origin][column_origin].includes('queen')).indexOf(data.playerMove.substring(2, 4)) !== -1){
             
              if(row_dest == 0 && !board[row_origin][column_origin].includes('queen'))
                board[row_dest][column_dest] = 'white queen';
              else
                board[row_dest][column_dest] = board[row_origin][column_origin];
              board[row_origin][column_origin] = '';

              if (Math.abs(row_origin - row_dest) > 1) {
                  board[(row_origin + row_dest) / 2][(column_origin + column_dest) / 2] = '';
                  let obligedMoves = mandatoryMoves(row_dest, column_dest, 'white', board[row_dest][column_dest].includes('queen'))
                  if(obligedMoves.length > 0) {
                    io.to(roomID).emit('move', data)
                    for(let i = 0; i < obligedMoves.length; i++) {
                      plusieurs_prises.push(data.playerMove.substring(2, 4) + obligedMoves[i]);
                      if(gameOver('black') === true){
                        console.log('Jamal a gagné');
                        io.to(roomID).emit('gameOver', 'white won')  
                      }
                      return;
                    }
                  }
              }
              io.to(roomID).emit('move', data);
              turn = 'black';
              if(gameOver('black') === true){
                console.log('Jamal a gagné');
                io.to(roomID).emit('gameOver', 'white won')
              }

            }
          }
        }
      }
    })
   
  });
  /**
   * Réception de l'événement 'joinRoom-service' et 'move' 
   * et réémission vers tous les utilisateurs connectés à la room
   */
   socket.on('joinRoom', function(data){
    
    // joueur qui rejoint la room = joueur 2
    socket.leave(roomID);
    roomID = data.roomName;
    socket.join(roomID)
    
    let room = roomArray.find(r => r.id == roomID);
    
    
    room.player2 = data.user;
    
    io.emit('room-service', [room.id, room.player1, room.player2]);
    socket.emit('playerNumber', playerNumber)

    clientsInRoom = io.nsps['/'].adapter.rooms[roomID].length;
    if(clientsInRoom === 2){ 
      roomArray.splice(roomArray.indexOf(roomID),1)
      
      
      io.emit('room-list', roomArray.map(r => r.id));
    }
    

    // jeu de dame -> mouvement joueur 2
    socket.on('move', function(data){
      
      if(turn == 'black') {
        
        let column_origin = colNames.indexOf(data.playerMove.substring(0, 1));
        let row_origin = data.playerMove.substring(1, 2) - 1;
        
        if(verifpiece(data)){
          let column_dest = colNames.indexOf(data.playerMove.substring(2, 3));
          let row_dest = data.playerMove.substring(3, 4) - 1;
          let obligedMoves = [];

          for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
              if(board[i][j].includes('black'))
               obligedMoves = mandatoryMoves(row_origin, column_origin, 'black', board[row_origin][column_origin].includes('queen'))
            }
          }
         
          if((obligedMoves.length === 0) || (obligedMoves.indexOf(data.playerMove.substring(2, 4)) !== -1)&& ((plusieurs_prises.length === 0) || (plusieurs_prises.indexOf(data.playerMove) !== -1))){
            
            plusieurs_prises = [];
            if(possibleMoves(row_origin, column_origin, 'black', board[row_origin][column_origin].includes('queen')).indexOf(data.playerMove.substring(2, 4)) !== -1){
              if(row_dest == 7 && !board[row_origin][column_origin].includes('queen'))
                board[row_dest][column_dest] = 'black queen';
              else
                board[row_dest][column_dest] = board[row_origin][column_origin];
              board[row_origin][column_origin] = '';
              
              if (Math.abs(row_origin - row_dest) > 1) {
                  board[(row_origin + row_dest) / 2][(column_origin + column_dest) / 2] = '';
                  let obligedMoves = mandatoryMoves(row_dest, column_dest, 'black', board[row_dest][column_dest].includes('queen'))
                  if(obligedMoves.length > 0) {
                    io.to(roomID).emit('move', data)
                    for(let i = 0; i < obligedMoves.length; i++) {
                      plusieurs_prises.push(data.playerMove.substring(2, 4) + obligedMoves[i]);
                      if(gameOver('white') === true){
                        console.log('Jamal a gagné');
                        io.to(roomID).emit('gameOver', 'black won')
                      }
                      return;
                    }
                  }

              }
              io.to(roomID).emit('move', data);
              turn = 'white';
              if(gameOver('white') === true){
                console.log('Jamal a gagné');
                io.to(roomID).emit('gameOver', 'black won')
              }

              
            }
          }
        }
       
      }
    })

  });

  /**
   * Réception de l'événement 'romm-list' et réémission vers tous les utilisateurs
   */
   socket.on('leaveRoom', function(data){
    roomID = data.roomName;
    clientsInRoom = io.nsps['/'].adapter.rooms[roomID].length;
    
    if(clientsInRoom >1){ 
      if(roomArray.indexOf(roomID) === -1)  {
        roomArray.push(roomID)
        
      }
    }

    else if(clientsInRoom ===1)  {
      roomArray.splice(roomArray.indexOf(roomID),1)

    }
    socket.leave(data.roomName);
   
    io.emit('room-list', roomArray.map(r=>r.id));

  })

   /**
   * Réception de l'événement 'chat-message' et réémission vers tous les utilisateurs
   */
   socket.on('chat-message', function (message) {
    message.username = loggedUser.username + " says : ";
    io.to(roomID).emit('chat-message', message);

  });

  /**
   * Déconnexion d'un utilisateur : broadcast d'un 'service-message'
   */
   socket.on('disconnect', function () {
    if(loggedUser !== undefined){
     
      var serviceMessage = {
        text: 'User "' + loggedUser.username + '" disconnected',
        type: 'logout'
      };
      socket.broadcast.emit('service-message', serviceMessage);
    }
  });

 });

/**
 * Lancement du serveur en écoutant les connexions arrivant sur le port 3000
 */
 http.listen(port, function(){
  console.log('listening on ${ port }');
});