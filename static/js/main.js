$( document ).ready(function() {
    var socket = io('http://127.0.0.1');
    socket.emit('my other event', { my: 'data' });
    console.log( "ready!" );
});