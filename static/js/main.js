var socketio;
var server = "http://127.0.0.1"

function process_config(data) {
    console.log(data);
}

function update_config() {
    // gather config
    var config = {in:0.33, out:6.66};

    socketio.emit('reconfigure', config);
}

$( document ).ready(function() {
    console.log( "ready!" );

    // Initialise the socketio object
    server = 'http://' + window.location.hostname + ':' + window.location.port;
    
    socketio = io(server);

    // Add callback to handle message from server
    socketio.on('config', process_config);

    // Send message to server
    socketio.emit('init');

    // Send config
    update_config();
});