(function() {

    var HOST = '0.0.0.0'; //'10.20.9.1';

    var INCOMING_MULTICAST = '234.18.1.1';
    module.exports.set_input_multicast_addr = function(x) {
        INCOMING_MULTICAST = x;
    }
    module.exports.get_input_multicast_addr = function() {
        return INCOMING_MULTICAST;
    }

    var INCOMING_PORT = '5000';
    module.exports.set_input_multicast_port = function(x) {
        INCOMING_PORT = x;
    }
    module.exports.get_input_multicast_port = function() {
        return INCOMING_PORT;
    }

    var DESTINATION_MULTICAST = '234.18.1.2';
    module.exports.set_output_multicast_addr1 = function(x) {
        DESTINATION_MULTICAST = x;
    }
    module.exports.get_output_multicast_addr1 = function() {
        return DESTINATION_MULTICAST;
    }

    var DESTINATION_PORT = '5000';
    module.exports.set_output_multicast_port1 = function(x) {
        DESTINATION_PORT = x;
    }
    module.exports.get_output_multicast_port1 = function() {
        return DESTINATION_PORT;
    }

    var DESTINATION_MULTICAST2 = '234.18.1.3';
    module.exports.set_output_multicast_addr2 = function(x) {
        DESTINATION_MULTICAST2 = x;
    }
    module.exports.get_output_multicast_addr2 = function() {
        return DESTINATION_MULTICAST2;
    }

    var DESTINATION_PORT2 = '5000';
    module.exports.set_output_multicast_port2 = function(x) {
        DESTINATION_PORT2 = x;
    }
    module.exports.get_output_multicast_port2 = function() {
        return DESTINATION_PORT2;
    }

    var input_percent_packet_drop = 0.0;
    module.exports.set_input_packet_drop = function(x) {
        input_percent_packet_drop = x;
    }
    module.exports.get_input_packet_drop = function() {
        return input_percent_packet_drop;
    }

    var output_percent_packet_drop = 0.1;
    module.exports.set_output_packet_drop = function(x) {
        output_percent_packet_drop = x;
    }
    module.exports.get_output_packet_drop = function() {
        return output_percent_packet_drop;
    }
    
    var dgram = require('dgram');
    var incoming = [];
    var outgoing = [];

    var input_filter_pass  = () => (Math.random() > (input_percent_packet_drop / 100));
    var output_filter_pass = () => (Math.random() > (output_percent_packet_drop / 100));

    module.exports.reset = function() {
        incoming.forEach(function(ig) {
            ig.socket.close();
        });

        outgoing.forEach(function(og) {
            og.socket.close();
        });
        
        incoming = [];
        outgoing = [];
    }

    module.exports.activate = function() {
        incoming.push(
            {
                socket            : dgram.createSocket({type: 'udp4', reuseAddr: true}),
                multicast_address : INCOMING_MULTICAST,
                multicast_port    : INCOMING_PORT,
                packetDropCount   : 0
            }
        );
        
        outgoing.push(
            {
                socket            : dgram.createSocket({type: 'udp4', reuseAddr: true}),
                multicast_address : DESTINATION_MULTICAST,
                multicast_port    : DESTINATION_PORT,
                packetDropCount   : 0
            }
        );

        outgoing.push(
            {
                socket            : dgram.createSocket({type: 'udp4', reuseAddr: true}),
                multicast_address : DESTINATION_MULTICAST2,
                multicast_port    : DESTINATION_PORT2,
                packetDropCount   : 0
            }
        );

        outgoing.forEach(function(og) {
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

        incoming[0].socket.on('message', function (incoming_packet, remote) {

            if (input_filter_pass()) {

                var PacketAlreadyDropped = false; // Use to prevent coincident packet loss.

                outgoing.forEach( function(og) {

                    var packetDrop = false;
                    if (!output_filter_pass()) {
                        // Drop a packet, so increment count on output.
                        og.packetDropCount += 1;
                    }

                    if (!PacketAlreadyDropped && og.packetDropCount) {
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
                                       og.multicast_port,
                                       og.multicast_address);
                    } else {
                        PacketAlreadyDropped = true;
                    }

                });
            }
        });

        incoming[0].socket.bind(incoming[0].multicast_port);
    }
}());