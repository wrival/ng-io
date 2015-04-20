// From the client-side use the following:
//
// socket.emit('login:register');
//		Pass in user name (email) and password.
//		Additional logic is needed to encrypt and verify user name availability.
//
// socket.emit('login:authorize', { email: x, password: y });
//
// socket.emit('login:logout'); // It logs out by socket id so there's no need to pass any data.
//
// And listen for:
// 'login:failed', 'login:passed'
	
	
	var mongoose = require('mongoose');
	var Users = mongoose.model('Users');
	

	server.ENV.queries['login:register'] = function(socket, data) {
		//console.log('login:register');
		// Save to Users collection
		User.update(
			{ _id: data.email },
			{ password: data.password },
			{ upsert: true },
			function(err, data) {
				if(data) {
					// Login passed, make a sessionId.
					var sessionId = server.ENV.genSessionId();
					server.ENV.sessions[sessionId] = data._id; // Remember User Id
					server.ENV.sockets[socket.id] = sessionId; // Remember what to delete on discon by socketId
					socket.emit('login:passed', sessionId);
				}
			}
		);
	};


	server.ENV.queries['login:authorize'] = function(socket, data) {
		//console.log('login:passed');
		var email = data.email;
		var password = data.password;
		if(email && password) {
			// Can't be nothing and...
			User.findOne({ _id: email }, '+password', function(err, dataU) {
				if(dataU) {
					// ...must match record in db.
					if(dataU.password === password) {
						// Login passed, make a sessionId.
						var sessionId = server.ENV.genSessionId();
						server.ENV.sessions[sessionId] = dataU._id; // Remember User Id
						server.ENV.sockets[socket.id] = sessionId; // Remember what to delete on discon by socketId
						socket.emit('login:passed', sessionId);
					} else {
						socket.emit('login:failed'); // Login failed (didn't match).
					}
				} else {
					socket.emit('login:failed'); // Login failed (no record).
				}
			});
		}
	};
	

	server.ENV.queries['login:logout'] = function(socket) {
		delete server.ENV.sessions[server.ENV.sockets[socket.id]];
		delete server.ENV.sockets[socket.id];
	}


	server.ENV.genSessionId = function() {
		var sessionId = "";
		var pool = "abcdefghijklmnopqrstuvwyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		while(!sessionId) {
			// Just to make sure it's unique
			// (in the very freak chance we that got the same random string as someone else).
			for(var i = 0; i < 32; i++) {
				sessionId += pool.charAt(Math.floor(Math.random() * pool.length));
			}
			if(server.ENV.sessions[sessionId]) {
				// Reset to try a different string.
				sessionId = "";
			}
		}
		//console.log('MADE SESSION ID: ' + sessionId);
		return sessionId;
	};

