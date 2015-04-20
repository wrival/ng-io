	
	var label = "";
	server.ENV.fruitsCounter = {};
	
	// Called from my <fruits-chart> directive.
	label = 'fruits-chart:add';
	server.ENV.queries[label] = function(socket, data) {
		//console.log("\tIN SS, INDEX: " + data.data);
		if(!server.ENV.fruitsCounter[socket.id]) {
			server.ENV.fruitsCounter[socket.id] = 1;
		} else {
			server.ENV.fruitsCounter[socket.id]++;
		}
		if(server.ENV.fruitsCounter[socket.id] <= 20) {
			// Only allow 20 votes.
			io.sockets.emit('Add Fruit', data.data);
		}
	};
	
	