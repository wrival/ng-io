// When <file-browser></file-browser> is reached, this object is returned.
// The directive (custom tag) is initially empty.
// Angular sets up and runs the controller for the directive.
// Then the app.ENV.directive function inside the controller automatically does this:
// 1. Creates a socket listener for itself.
// 2. Emits a request for the current directive.
// 3. The listener populates the directive when it gets its content and triggers the compile.
	
	
	app.directive('fileBrowser', function() {
		// Angular parses "file-browser" and loads camel case diretive: "fileBrowser"
		// <file-browser></file-browser>
		return {
			restrict: 'E', // An Element
			template: function() {
				var directive = 'file-browser';
				if(app.ENV.cache.directives[directive]) {
					return app.ENV.cache.directives[directive];
				}
			},
			controller: function($scope, $compile, socket) {
// DIRECTIVE'S LOGIC.....................
				
				
				$scope.keyword = "";
				$scope.file = false;
				$scope.openFile = function(file, type, desc) {
					$scope.file = file;
					$scope.desc = desc;
					if(type === "folder") {
						// Set it as the search and show all files now.
						$scope.keyword = file;
						$('html, body').animate({ scrollTop: $('input').offset().top - 24 });
					} else {
						// Open modal with file.
						$scope.code = "";
						$scope.modal = true;
						$scope.sample($scope.file, function(html) {
							$scope.code = html;
						});
					}
				};
				$scope.isFile = function(type) {
					if($scope.keyword || type === "folder") return true;
				};
				$scope.isOpen = function(file) {
					return $scope.file === file;
				};
				
				$scope.query('manifest:get', "", function(data) {
					$scope.files = data;
				});
				
				
// .....................DIRECTIVE'S LOGIC.
				// Instead of using template/templateUrl (http/ajax), this uses sockets.
				// Request the file name "file-browser", ".html" is appended to it later.
				$scope.directive('file-browser', $scope, $compile, socket); // reusable from app.js
			}
		};
	});

