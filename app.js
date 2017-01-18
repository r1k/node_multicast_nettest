var express = require('express'); 
var app     = express();
var http    = require('http').Server(app);

var logger  = require('morgan');
//var io      = require('socket.io')(http);

app.use(logger('dev'));

var file_path = __dirname + '/static';
app.use(express.static(file_path));

http.listen(5000, function() {  
  console.log('listening');
});

//io.on('connection', function(socket) {  
//  console.log('a user connected');
//  socket.on('disconnect', function() {
//    console.log('user disconnected');
//  });
//});