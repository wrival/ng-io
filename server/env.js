//////////////////////////////////////////////////////////////////////////////
// SERVER SIDE
// Server environment, authorization policies and cache placeholders.
	

	var fs = require('fs');
	
	// sessions:	sessions[sessionId] = userId (so can reference id and require a login)
	//				(sessionId is generated after a successful login.)
	// sockets:		sockets[socket.id] = sessionId (so can delete sessions on disconnect)
	//				This means that you can get a userId by using their socketId
	//				e.g. sessions[sockets[socket.id]] = userId
	// auths:		{ page1: true, page2: true, 'contacts:get': true }
	// 				are view requests and/or queries that require being logged in
	// filecache:	files are read off of disk and put into this object
	// filemod:		file's modified time (reloads cache if different)
	// viewcache:	where the cache per view is stored (can have params making it unique)
	// nocache:		{ page1: true, page2: true }
	//				pages set to true won't be saved in cache
	//				(in case want to do server-side dynamic pages)
	// queries:		placeholder for all the functions in the queries folder
	// query:		reusable cache from a queries (e.g. countries select options)
	
	server.ENV = {
		sessions: {},
		sockets: {},
		auths: {},
		filecache: {},
		filemod: {},
		viewcache: {},
		nocache: {},
		queries: {},
		query: {}
	};
	server.ENV.checkModTime = function(load, page, ascii) {
		// Check if a newer file on disk and update cache.
		fs.stat(load, function(err, stats) {
			if(stats) {
				if(server.ENV.filemod[page] !== stats.mtime.toString()) {
					server.ENV.filemod[page] = stats.mtime.toString();
					if(ascii) {
						fs.readFile(load, 'utf8', function(errors, content) {
							if(stats) {
								//console.log("UPDATING FILE CACHE: " + page);
								server.ENV.filecache[page] = content;
							}
						});
					} else {
						fs.readFile(load, function(errors, content) {
							if(stats) {
								//console.log("UPDATING FILE CACHE: " + page);
								server.ENV.filecache[page] = content;
							}
						});
					}
				}
			}
		});
	};
	server.ENV.rememberModTime = function(load, page) {
		// Remember mod-time for cache too.
		//console.log("\tY..IN REMEMBERING");
		fs.stat(load, function(err, stats) {
			if(stats) {
				//console.log("\tY..GOT MOD: " + page + " : " + stats.mtime);
				server.ENV.filemod[page] = stats.mtime;
			}
		});
	};
	
	// Load policies.
	if(fs.existsSync("./server/policies/auths.json")) {
		var content = fs.readFileSync("./server/policies/auths.json");
		server.ENV.auths = JSON.parse(content);
	}
	if(fs.existsSync("./server/policies/nocache.json")) {
		var content = fs.readFileSync("./server/policies/nocache.json");
		server.ENV.nocache = JSON.parse(content);
	}
	

	// Preload functions for the query listener in router-ws.js.
	var files = fs.readdirSync("./server/data/queries");
	for(var i in files) {
		if(files[i].match(/\.js$/)) {
			require('./../server/data/queries/' + files[i]);
		}
	}
	
