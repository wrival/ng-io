//////////////////////////////////////////////////////////////////////////////
// SERVER SIDE
// The ws (socket) request server (not to be confused with the router-http).
// Socket Listeners:
// 1. On 'connection', adds the following other listeners for the current socket:
// 2. On 'disconnect', destroys the socket and its listeners.
// 3. On 'query', runs the app's logic (preloaded in env.js) in responders folder.
// 4. On 'request', just like a get-http request, but content is sent thru sockets.
// 5. On 'login', accepts { username: '', password: '' }, emits login:passed/login:failed
// 6. On 'logout', like disconnect, but doesn't destroy the socket nor its callbacks.
	
	
	var fs = require('fs');
	
	
	// Uncomment the wsLog calls to enable writing logs to /logs/ws.tsv
	function wsLog(socketId, label, value) {
		// Log request.
		var d = new Date();
		var now = d.getTime();
		var line = now + "\t" + socketId + "\t" + label + "\t" + JSON.stringify(value) + "\r\n";
		fs.appendFile('logs/ws.tsv', line, function (err) {});
	}
	

	module.exports = function(io) {
		
		io.on('connection', function(socket) {
			
			
			if(!server.ENV.sockets.length) {
				// Start worker now if not already running.
				server.ENV.fruitsUpdater();
			}
			
			
			socket.on('disconnect', function() {
				// Clear all their memory when exiting.
				delete server.ENV.sessions[server.ENV.sockets[socket.id]];
				delete server.ENV.sockets[socket.id];
				//wsLog(socket.id, "disconnect");
				socket = undefined;
				
				if(!server.ENV.sockets.length) {
					// Stop worker(s) if no one's no longer connected.
					clearTimeout(server.ENV.fruitsLoop);
				}
			});
			socket.on('query', function(query) {
				// If view doesn't require a login -or- it requires authentication AND if logged in.
				if(!server.ENV.auths[query.label] || server.ENV.sessions[query.session]) {
					// Perform its function if it's defined.
					if(typeof server.ENV.queries[query.label] === 'function') {
						server.ENV.queries[query.label](socket, query);
					}
				}
				//wsLog(socket.id, "query", query);
			});
			socket.on('request', function(request) {
				// Socket Content Loader (like the http router)
				// (for loading views and directives, reusable security and cache code)
				
				// request.view can be "profile?id", and request.session is there too
				var type = request.type; // directive, sample, or undefined: view
				var view = request.view;
				var target = request.target; // The return target to populate (like a callback)
				
				if(view.match(/\.\./) || view.match(/\.\//)) {
					return; // Prevent hacks to files outside of project folder.
				}
				while(view.match(/^\//)) {
					view = view.replace("/", "");
				}
				
				// you may add a query string (like a get) to make the request dynamic and unique
				var param = {};
				var params = {};
				if(view.match(/\?/)) {
					view = view.split("?");
					params = view[1];
					view = view[0];
					if(params.match(/&/)) {
						params = params.split("&");
						for(var i in params) {
							var pair = params[i].split("=");
							param[params[i]] = pair[0]; // name
							param[pair[0]] = pair[1]; // value
						}
					} else {
						param = params;
					}
				}
				
				var file = "";
				var path = "";
				switch(type) {
					case 'directive': file = "./www/directives/" + view + ".html"; break;
					case 'sample': file = "./" + view; break; // Code sample of site's files.
					default: file = "./www/views/" + view + ".html";
				}
				
				// If view doesn't require a login -or- it requires authentication AND if logged in.
				if(!server.ENV.auths[view] || server.ENV.sessions[request.session]) {
					if(server.ENV.viewcache[request.view]) {
						//console.log("SENDING SERVER-SIDE CACHE: " + view);
						socket.emit(target, server.ENV.viewcache[view]);
						
						// Now check if a newer file on disk and update if necessary.
						server.ENV.checkModTime(request.view + view + ".html", view);
						
					} else {
						if(server.ENV.filecache[file]) {
							//console.log("VIEW USING FILE CACHE: " + file); // Only first user reads the actual file.
							var data = {
								view: view,
								content: server.ENV.filecache[file],
								params: param
							};
							if(!server.ENV.nocache[view]) {
								server.ENV.viewcache[view] = data;
							}
							socket.emit(target, data);
							
							// Now check if a newer file on disk and update if necessary.
							server.ENV.checkModTime(file, view);
							
						} else {
							//console.log("READING VIEW FILE: " + file);
							fs.readFile(file, 'utf8', function(errors, content) {
								var data = {
									view: view,
									content: content,
									params: param
								};
								if(!server.ENV.nocache[view]) {
									server.ENV.viewcache[view] = data;
								}
								socket.emit(target, data);
								
								// Remember mod-time for cache too.
								server.ENV.rememberModTime(file, view);
								
							});
						}
					}
				}
				//wsLog(socket.id, "request", file);
				// else: do nothing.
			});
			
		});
		
	};