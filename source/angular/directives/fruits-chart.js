	
	app.directive('fruitsChart', function() {
		return {
			restrict: 'E',
			template: function() {
				var directive = 'fruits-chart';
				if(app.ENV.cache.directives[directive]) {
					return app.ENV.cache.directives[directive];
				}
			},
			controller: function($scope, $compile, socket) {
				
				delete window.socket._callbacks['Add Fruit'];
				socket.on('Add Fruit', function(fruitsIndex) {
					//console.log("Fruit Index: " + fruitsIndex);
					data[fruitsIndex].Votes++;
					update(data);
				});
				
				if(!$scope.$parent.votesCount) {
					$scope.$parent.votesCount = 0;
				}
				$scope.selectFruit = function(fruitIndex) {
					//console.log("ADDING: " + fruitIndex);
					$scope.$parent.votesCount++;
					if($scope.$parent.votesCount <= 20) {
						// Only allow 20 votes.
						$scope.query('fruits-chart:add', fruitIndex);
					}
				}
				
				$scope.directive('fruits-chart', $scope, $compile, socket);
			}
		};
	});
	