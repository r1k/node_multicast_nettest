var express = require('express'); 
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);

http.listen(process.env.PORT || 5000, function() {  
  console.log('listening');
});

io.on('connection', function(socket) {  
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});