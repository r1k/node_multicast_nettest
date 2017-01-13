var HOST = '10.20.19.1';

var INCOMING_MULTICAST = process.argv[2];
var INCOMING_PORT = process.argv[3];
var DESTINATION_MULTICAST = process.argv[4];
var DESTINATION_PORT = process.argv[5];
var DESTINATION_MULTICAST2 = process.argv[6];
var DESTINATION_PORT2 = process.argv[7];

var dgram = require('dgram');

var incoming = dgram.createSocket({type: 'udp4', reuseAddr: true});
var outgoing = []
outgoing.push(
    {
        socket:            dgram.createSocket({type: 'udp4', reuseAddr: true}),
        multicast_address: DESTINATION_MULTICAST,
        multicast_port:    DESTINATION_PORT
    }
);

outgoing.push(
    {
        socket:            dgram.createSocket({type: 'udp4', reuseAddr: true}),
        multicast_address: DESTINATION_MULTICAST2,
        multicast_port:    DESTINATION_PORT2
    }
);

outgoing.forEach(function(og){
    og.socket.bind(HOST);
    og.socket.on('listening', function() {
        og.socket.setBroadcast(true);
        og.socket.setMulticastTTL(128);
        og.socket.addMembership(og.multicast_address, HOST);
    });
});

incoming.on('listening', function () {
    var address = incoming.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
    incoming.setBroadcast(true)
    incoming.setMulticastTTL(128); 
    incoming.addMembership(INCOMING_MULTICAST, HOST);
});

var input_filter_pass  = () => (true);
var output_filter_pass = () => (Math.random() > 0.005);

incoming.on('message', function (incoming_packet, remote) {
    if (input_filter_pass()) {
        outgoing.forEach(function(og) {
            if (output_filter_pass()) {
                og.socket.send(incoming_packet,
                               0,
                               incoming_packet.length,
                               og.multicast_port,og.multicast_address);
            }
        });
    }
});

incoming.bind(INCOMING_PORT, INCOMING_MULTICAST);