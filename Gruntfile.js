// Gruntfile.js
// > npm init (to create package.json if needed)
// > npm install grunt --save-dev
// > npm install grunt-concurrent --save-dev
// > npm install grunt-contrib-less --save-dev
// > npm install grunt-contrib-uglify --save-dev
// > npm install grunt-contrib-watch --save-dev
// > npm install grunt-nodemon --save-dev
// > grunt	// runs task: 'default'
	
	
	module.exports = function(grunt) {
		
		grunt.loadNpmTasks('grunt-concurrent');
		grunt.loadNpmTasks('grunt-contrib-less');
		grunt.loadNpmTasks('grunt-contrib-uglify');
		grunt.loadNpmTasks('grunt-contrib-watch');
		grunt.loadNpmTasks('grunt-nodemon');
		grunt.registerTask('default', '', function() {
			var taskList = [
				'concurrent',
				'less',
				'uglify',
				'watch',
				'nodemon'
			];
			grunt.task.run(taskList);
		});

		grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),
			less: {
				production: {
					files: {
						"www/styles.css": "source/less/*.less"
					}
				},
  			},
			uglify: {
				options: {
					mangle: false,
					banner: '\n/*\n\tMongo, Angular, socket.IO, Node, jQuery, Justin L. Fisher, <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n\n',
				},
				build: {
					files: {
						'www/script.js': [
							'<banner>',
							'source/libs/*.js',
							'source/angular/app.js',
							'source/angular/directives/*.js',
							'source/angular/factories/*.js'
						]
					}
				}
			},
			nodemon: {
				dev: {
					script: 'server.js'
				},
				options: {
					watch: ['www/**.*', 'www/directives/**.*', 'www/views/**.*']
				}
			},
			watch: {
				less: {
					files: ['source/less/*.less'],
					tasks: ['less']
				},
				scripts: {
					files: ['source/angular/directives/*.js', 'source/angular/factories/*.js', 'source/libs/**/*'],
					tasks: ['uglify']
				}
			},
			concurrent: {
				dev: {
					tasks: ['nodemon', 'watch'],
					options: {
						logConcurrentOutput: true
					}
				}
			}
		});
	};