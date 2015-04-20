	
	app.directive('sharedModal', function() {
		return {
			restrict: 'E',
			template: function() {
				var directive = 'shared-modal';
				if(app.ENV.cache.directives[directive]) {
					return app.ENV.cache.directives[directive];
				}
			},
			controller: function($scope, $compile, socket) {
				$scope.modal = false;
				$scope.directive('shared-modal', $scope, $compile, socket);
				$scope.code = "";
			}
		};
	});
