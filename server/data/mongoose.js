//////////////////////////////////////////////////////////////////////////////
// SERVER SIDE
// Keep connected to MongoDB.
	
	
	var mongoose = require('mongoose');
	
	
	var connect = function() {
		var options = { server: { socketOptions: { keepAlive: 1 } } };
		mongoose.connect('mongodb://localhost/NGIO', options); 
	}
	connect();
	mongoose.connection.on('error', function(err) {
		console.log(err);
	});
	mongoose.connection.on('disconnected', function() {
		connect();
	});
	require('./../../server/data/schemas.js');