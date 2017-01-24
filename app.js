var express = require('express'); 
var app     = express();
var http    = require('http').Server(app);

var logger  = require('morgan');
var io      = require('socket.io')(http);

var proxy   = require('./proxy');

app.use(logger('dev'));

var file_path = __dirname + '/static';
app.use(express.static(file_path));

http.listen(8080, function() {  
  console.log('listening');
});

io.on('connection', function(socket) {  
  console.log('browser connected');

  socket.on('disconnect', function() {
    console.log('browser disconnected');
  });

  socket.on('init', function() {
    // Send out initial config
    var config = {
      in_mcast_addr : proxy.get_input_multicast_addr(),
      in_mcast_port : proxy.get_input_multicast_port(),

      out_mcast_addr1 : proxy.get_output_multicast_addr1(),
      out_mcast_port1 : proxy.get_output_multicast_port1(),

      out_mcast_addr2 : proxy.get_output_multicast_addr2(),
      out_mcast_port2 : proxy.get_output_multicast_port2(),

      in_drop_perc : proxy.get_input_packet_drop(),
      out_drop_perc : proxy.get_output_packet_drop()
    }
    socket.emit('config', config);
  });

  socket.on('reconfigure', function(dat) {
    console.log('reconfigure event');
    console.log(dat);

    // attempt to set proxy settings
    proxy.set_input_packet_drop(dat.in);
    proxy.set_output_packet_drop(dat.out);

    console.log("get_input_packet_drop  :" + proxy.get_input_packet_drop());
    console.log("get_output_packet_drop :" + proxy.get_output_packet_drop());
  });
});