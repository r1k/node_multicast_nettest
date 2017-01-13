var HOST = '10.20.19.1';

var INCOMING_MULTICAST = process.argv[2];
var INCOMING_PORT = process.argv[3];

var DESTINATION_MULTICAST = process.argv[4];
var DESTINATION_PORT = process.argv[5];

var DESTINATION_MULTICAST2 = process.argv[6];
var DESTINATION_PORT2 = process.argv[7];

var dgram = require('dgram');

var incoming = dgram.createSocket({type: 'udp4', reuseAddr: true});
var outgoing = dgram.createSocket({type: 'udp4', reuseAddr: true});
var outgoing2 = dgram.createSocket({type: 'udp4', reuseAddr: true});

outgoing.bind(HOST);
outgoing.on('listening', function() {
    outgoing.setBroadcast(true);
    outgoing.setMulticastTTL(128);
    outgoing.addMembership(DESTINATION_MULTICAST, HOST)
});

outgoing2.bind(HOST);
outgoing2.on('listening', function() {
    outgoing2.setBroadcast(true);
    outgoing2.setMulticastTTL(128);
    outgoing2.addMembership(DESTINATION_MULTICAST2, HOST)
});

incoming.on('listening', function () {
    var address = incoming.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
    incoming.setBroadcast(true)
    incoming.setMulticastTTL(128); 
    incoming.addMembership(INCOMING_MULTICAST, HOST);
});


var input_filter_pass = function() {
    return true;
};

var output_filter_pass = function() {
    if (Math.random() > 0.01) {
        return true;
    }
    return false;
}


incoming.on('message', function (incoming_packet, remote) {
    if (input_filter_pass()) {
        if (output_filter_pass()) {
            outgoing.send(incoming_packet, 0, incoming_packet.length, DESTINATION_PORT, DESTINATION_MULTICAST);
        }
        if (output_filter_pass()) {
            outgoing2.send(incoming_packet, 0, incoming_packet.length, DESTINATION_PORT2, DESTINATION_MULTICAST2);
        }
    }
});

incoming.bind(INCOMING_PORT, INCOMING_MULTICAST);