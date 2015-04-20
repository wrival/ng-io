	
	var mongoose = require('mongoose');
	var Manifest = mongoose.model('Manifest');
	var label = "";
	
	
	// Called from my <file-browser> directive.
	label = 'manifest:get';
	server.ENV.queries[label] = function(socket, data) {
		if(server.ENV.query[label]) {
			socket.emit(label, server.ENV.query[label]);
		} else {
			Manifest.find(function(err, data) {
				socket.emit(label, data);
				server.ENV.query[label] = data;
			});
		}
	};
	

	// Copy to create more...
	// label = 'manifest:create';
	// server.ENV.queries[label] = function(socket, data) {
	// 	if(server.ENV.query[label]) {
	// 		socket.emit(label, server.ENV.query[label]);
	// 	} else {
	// 		Manifest.find(function(err, data) {
	// 			socket.emit(label, data);
	// 			server.ENV.query[label] = data;
	// 		});
	// 	}
	// };
	
	