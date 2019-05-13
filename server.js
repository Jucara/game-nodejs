let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

http.listen(4000, function(){
  console.log('listening on: 4000')
});

// let matrix = [];
// for(let row = 0; row < 8; row++){
//   for(let col = 0; col < 8; col++){
//     matrix[row][col] = 0;
//   }
// }
// console.log(matrix);

io.on('connection', function(socket){
  console.log('Client connected');
  //console.log(matrix);
  // if (players.length >= 2 )
  //   return;
  // players.push(socket);
  socket.on('move', function(data){
    console.log(data);
  })
  socket.on("Press button", function(data){
    console.log('Received button press', data)
    if (players.indexOf(socket) == turn){
      socket.emit('message', 'Nice, you played a turn');
      turn = (turn+1)%2
    } else {
      socket.emit('message', "It's not your turn, fool!");
    }
  })
})

// let players = [];
// let turn = 0;