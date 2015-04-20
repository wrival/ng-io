// Makes all socket listeners automatically update angular when ran.
	
	app.factory('socket', function($rootScope) {
		return {
			on: function(eventName, callback) {
				socket.on(eventName, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						callback.apply(socket, args);
					});
				});
			},
			emit: function(eventName, data, callback) {
				socket.emit(eventName, data, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						if(callback) callback.apply(socket, args);
					});
				});
			}
		};
	});