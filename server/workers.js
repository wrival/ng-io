	
	server.ENV.fruitsUpdater = function() {
		// Emulates users selecting their favorite fruits.
		
		var fruitsIndex = Math.floor(Math.random() * 5);
		var delay = (Math.floor(Math.random() * 10) + 1) * 500;
		
		io.sockets.emit('Add Fruit', fruitsIndex);
		//console.log('\tSending fruit index: ' + fruitsIndex + ' ..will repeat in: ' + delay + 'ms.');
		server.ENV.fruitsLoop = setTimeout(server.ENV.fruitsUpdater, delay);
	}
	