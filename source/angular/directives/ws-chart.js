	
	app.directive('wsChart', function() {
		return {
			restrict: 'E',
			template: function() {
				var directive = 'ws-chart';
				if(app.ENV.cache.directives[directive]) {
					return app.ENV.cache.directives[directive];
				}
			},
			controller: function($scope, $compile, socket) {
				$scope.directive('ws-chart', $scope, $compile, socket);
			}
		};
	});
	