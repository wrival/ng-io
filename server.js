//////////////////////////////////////////////////////////////////////////////
// SERVER SIDE
	
	
	// Load mongoose.
	require("./server/data/mongoose");
	
	// How to respond to http requests.
	var router = require('./server/router-http');
	server = require('http').createServer(function(request, response) {
		router(request, response);
	});
	
	// Configure server environment.
	require("./server/env.js");
	
	// How to respond to web socket requests.
	io = require('socket.io')(server);
	require("./server/router-ws")(io);
	
	// Workers (processes that run in the background).
	require("./server/workers");
	
	// An smtp email service.
	//require('./server/mailer');
	
	// Start web server.
	server.listen(8001, '127.0.0.1');
	