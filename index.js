let app = require('express')();
let path = require('path');
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(process.env.PORT || 4000, function(){
    console.log('Your server is running');
});