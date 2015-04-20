	
	
	var socket = io.connect();
	app = angular.module('app', []);

	// The nocache is hackable on client-side only.
	// The server will not provide any new protected info if not logged in. 
	// Caching prevents unneeded socket requests.
	// Using cache also means that any static view that have already been loaded 
	// will continue to display even if the node server is no longer running! 
	// SO BEWARE THAT AS CONTENT IS CHANGED EVEN A HARD-RELOAD ON THE BROWSER ISN'T 
	// ENOUGH! THE NODE SERVER MUST RESTART TO CLEAR THE CACHE.
	// To use nocache set it like this: ..nocache.views: { 'page': true, 'another': true }
	app.ENV = {
		session: "",
		cache: {
			views: {},
			queries: {},
			directives: {},
			samples: {}
		},
		nocache: {
			views: {},
			queries: {},
			directives: {},
			samples: {}
		},
		lastload: {
			view: {},
			params: {},
			query: {},
			directive: {},
			sample: {}
		}
	};
	
	app.controller('Global', function($scope, $compile, socket) {
		// Shared space for init/listeners/triggers for the entire app.
		// (It's always present regardless of what's been loaded, etc.)
		
		$scope.query = function(label, data, callback) {
			// 1. delete (reset for current socket, if needed, prevent dupes)
			delete window.socket._callbacks[label];
			// 2. create listener for response
			socket.on(label, function(data) {
				// 4. Exec callback
				callback(data);
				if(!app.ENV.nocache.queries[label]) {
					app.ENV.cache.queries[label] = data;
				}
				app.ENV.lastload.query = label;
			});
			// 3. emit to server
			socket.emit('query', { label: label, data: data, session: app.ENV.session });
		};
		$scope.directive = function(directive, $scope, $compile, socket) {
			if(!app.ENV.cache.directives[directive]) {
				// 1. delete (prevent dupes for directives in nocache)
				delete window.socket._callbacks[directive];
				// 2. create listener for response
				socket.on(directive, function(data) {
					// 4. Exec callback
					$(directive).html($compile(data.content)($scope));
					if(!app.ENV.nocache.directives[directive]) {
						app.ENV.cache.directives[directive] = data.content;
					}
					app.ENV.lastload.directive = directive;
				});
				// 3. emit to server
				var request = {
					type: 'directive',
					view: directive,
					session: app.ENV.session,
					target: directive
				};
				socket.emit('request', request);
			}
		};
		$scope.sample = function(sample, callback) {
			if(!sample) { return; }
			if(app.ENV.cache.samples[sample]) {
				//console.log("Using client cache.");
				$scope.code = app.ENV.cache.samples[sample];
				app.ENV.lastload.sample = sample;
			} else {
				// 1. delete (prevent dupes for directives in nocache)
				delete window.socket._callbacks[sample];
				// 2. create listener for response
				socket.on(sample, function(data) {
					// 4. Exec callback
					callback(data.content);
					if(!app.ENV.nocache.samples[sample]) {
						app.ENV.cache.samples[sample] = data.content;
					}
					app.ENV.lastload.sample = sample;
				});
				// 3. emit to server
				var request = {
					type: 'sample',
					view: sample,
					session: app.ENV.session,
					target: sample
				};
				//console.log(request.view);
				socket.emit('request', request);
			}
		};
		$scope.renderMain = function(content) {
			// Renders view content (easily add animation or other logic here).
			$('main').html($compile(content)($scope));
			$('html,body').animate({ scrollTop: 0 }, 'fast');
		};
		$scope.load = function(view) {
			// Triggers for the app's links.
			if(app.ENV.cache.views[view]) {
				//console.log("Using client cache.");
				$scope.renderMain(app.ENV.cache.views[view]);
			} else {
				var request = {
					view: view,
					session: app.ENV.session,
					target: 'Main'
				};
				//console.log("Requesting: " + request.view + " SESSION: " + app.ENV.session);
				socket.emit('request', request);
			}
		};
		$scope.modal = false;
		
		
		// Listen for new content from server.
		socket.on('Main', function(data) {
			app.ENV.lastload.view = data.view;
			app.ENV.lastload.params = data.params;
			if(!app.ENV.nocache.views[data.view]) {
				app.ENV.cache.views[data.view] = data.content;
			}
			$scope.renderMain(data.content);
		});
		
		// Init: load main (home) page.
		$scope.load('main');
 	});
