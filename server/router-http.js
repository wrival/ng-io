//////////////////////////////////////////////////////////////////////////////
// SERVER SIDE
// The http request server (not to be confused with the socket, router-ws).
	
	
	var fs = require('fs');
	
	
	// Uncomment the httpLog calls to enable writing logs to /logs/http.tsv
	function httpLog(request, load) {
		// Log request.
		var d = new Date();
		var now = d.getTime();
		var line = now + "\t" + request.connection.remoteAddress + "\t" + load + "\r\n";
		fs.appendFile('logs/http.tsv', line, function (err) {});
	}
	
	
	// Configure our http header's mime types.
	var mimeTypes = {
		html:	"text/html",
		json:	"text/json",
		js:	"text/javascript",
		css:	"text/css",
		svg:	"image/svg+xml",
		tsv:	"text/tab-separated-values",
		cvs:	"text/csv",
		gif:	"image/gif",
		png:	"image/png",
		jpg:	"image/pjpeg",
		jpeg:	"image/jpeg",
		ico:	"image/x-icon",
		zip:	"application/zip"
	};
	var ascii = {
		html: true,
		json: true,
		js: true,
		css: true,
		svg: true,
		tsv: true,
		cvs: true
	};
	
	module.exports = function(request, response) {
		
		
		var page = request.url; // /
		var load = "www" + page; // www/
		
		if(page.match(/\/$/)) {
			// If just a folder.
			page += 'index.html';
			load += 'index.html';
		}
		
		// Get request file type.
		if(page.match(/\..+$/)) {
		 	var type = page.match(/\..+$/); // .JPG
			var split = type.toString().split("\."); // JPG
		 	type = split[split.length - 1].toLowerCase(); // jpg
		}
		

		// Write the http header.
		var contentType;
		if(mimeTypes[type]) {
			contentType = { "Content-type": mimeTypes[type] };
		} else {
			contentType = { "Content-type": "text/plain" };
		}
		response.writeHead(200, contentType);
		

		if(server.ENV.filecache[page]) {
			
			// Send out what's in cache immediately (for speed).
			//console.log("FILE CACHE: " + load);
			response.end(server.ENV.filecache[page]);
			
			// Now check if a newer file on disk and update if necessary.
			server.ENV.checkModTime(load, page, ascii[type]);
			
			//httpLog(request, load);
			
		} else if(fs.existsSync(load)) {
			
			if(ascii[type]) {
				// Wasn't in cache and it exists on disk so read it now.
				fs.readFile(load, 'utf8', function(errors, content) {
					//console.log("READING FILE: " + load);
					server.ENV.filecache[page] = content;
					response.end(content);
					
					// Remember mod-time for cache too.
					server.ENV.rememberModTime(load, page);
					
				});
			} else {
				fs.readFile(load, function(errors, content) {
					//console.log("READING BINARY FILE: " + load);
					server.ENV.filecache[page] = content;
					response.end(content);
					// Remember mod-time for cache too.
					server.ENV.rememberModTime(load, page);
				});
			}
			
			//httpLog(request, load);
			
		} else {
			// Didn't exist so do nothing, just end request.
			response.end("");
			return;
		}
	};