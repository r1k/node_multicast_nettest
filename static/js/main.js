var socketio;

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
    socketio = io('http://127.0.0.1:8080');

    // Add callback to handle message from server
    socketio.on('config', process_config);

    // Send message to server
    socketio.emit('init');

    // Send config
    update_config();
});