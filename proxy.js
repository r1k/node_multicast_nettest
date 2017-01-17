var HOST = '10.20.9.1';

var INCOMING_MULTICAST = process.argv[2];
var INCOMING_PORT = process.argv[3];
var DESTINATION_MULTICAST = process.argv[4];
var DESTINATION_PORT = process.argv[5];
var DESTINATION_MULTICAST2 = process.argv[6];
var DESTINATION_PORT2 = process.argv[7];

var dgram = require('dgram');

var incoming = [];
incoming.push(
    {
        socket:            dgram.createSocket({type: 'udp4', reuseAddr: true}),
        multicast_address: INCOMING_MULTICAST,
        multicast_port:    INCOMING_PORT,
        packetDropCount:   0
    }
);

var outgoing = []
outgoing.push(
    {
        socket:            dgram.createSocket({type: 'udp4', reuseAddr: true}),
        multicast_address: DESTINATION_MULTICAST,
        multicast_port:    DESTINATION_PORT,
        packetDropCount:   0
    }
);

outgoing.push(
    {
        socket:            dgram.createSocket({type: 'udp4', reuseAddr: true}),
        multicast_address: DESTINATION_MULTICAST2,
        multicast_port:    DESTINATION_PORT2,
        packetDropCount:   0
    }
);

outgoing.forEach(function(og){
    og.socket.bind(HOST);
    og.socket.on('listening', function() {
        og.socket.setBroadcast(true);
        og.socket.setMulticastTTL(128);
    });
});

incoming.forEach(function(ig) {
    ig.socket.on('listening', function () {
        var address = ig.socket.address();
        console.log('UDP Client listening on ' + address.address + ":" + address.port);
        ig.socket.setBroadcast(true)
        ig.socket.setMulticastTTL(128);
        ig.socket.addMembership(ig.multicast_address, HOST);
    });
});

var input_filter_pass  = () => (true);
var output_filter_pass = () => (true);//(Math.random() > 0.001);

incoming[0].socket.on('message', function (incoming_packet, remote) {
    if (input_filter_pass()) {

        var PacketAlreadyDropped = false; // Use to prevent coincident packet loss.

        outgoing.forEach(function(og) {

            var packetDrop = false;
            if (!output_filter_pass()) {
                // Drop a packet, so increment count on output.
                og.packetDropCount += 1;
            }

            if (!PacketAlreadyDropped && og.packetDropCount)
            {
                // We haven['t dropped this packet on any other output
                // but need to for this output then signal drop and
                // decrement the count.
                packetDrop = true;
                og.packetDropCount -= 1;
            }

            if (!packetDrop) {
                og.socket.send(incoming_packet,
                               0,
                               incoming_packet.length,
                               og.multicast_port,og.multicast_address);
            } else {
                PacketAlreadyDropped = true;
            }

        });
    }
});

incoming[0].socket.bind(incoming[0].multicast_port);