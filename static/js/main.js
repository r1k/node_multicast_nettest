$( document ).ready(function() {
    var socket = io('http://127.0.0.1:5000');
    socket.emit('other event', { my: 'data' });
    console.log( "ready!" );
});