module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json'),
		libName = pkg.name;

	// wrap files
	var wrap = function(files, dest) {
		code = grunt.file.read('build/prefix.js').toString();

		files.forEach(function(file) {
			code += grunt.file.read(file).toString();
		});

		code += grunt.file.read('build/suffix.js').toString();
		grunt.file.write(dest, code);
	};

	grunt.registerTask('wrap', function() {
		var done = this.async();
		grunt.file.glob('src/**/*.js', null, function(err, files) {
			if (!err) {
				wrap(files, 'build/$assembled.js');
			}

			done();
		});
	});

	var uglify = {
		options: {
			banner: grunt.file.read('build/banner.txt').toString()
		},

		latest: {
			src: 'build/$assembled.js',
			dest: 'dist/' + libName + '-latest.js'
		},

		release: {
			src: 'build/$assembled.js',
			dest: 'dist/' + libName + '-' + pkg.version + '.js'
		}
	};

	var vendor = [
		'vendor/extends-0.0.2.js',
		'vendor/gtemplate-0.0.3.js',
		'vendor/jquery.min.js',
		'vendor/lodash.min.js',
		'build/$assembled.js',
	];

	var jasmine = {
		latest: {
			src: vendor,
			options: {
				keepRunner: true,
				outfile: './test.html',
				specs: "test/**/*Spec.js"
			}
		}
	};

	grunt.initConfig({
		pkg: pkg,
		uglify: uglify,
		jasmine: jasmine
	});

	Object.keys(pkg.devDependencies).forEach(function(name) {
		if (name.substring(0, 6) === 'grunt-') {
			grunt.loadNpmTasks(name);
		}
	});

	grunt.registerTask('build', ['wrap', 'uglify:latest', 'jasmine']);
	grunt.registerTask('release', ['wrap', 'uglify:release', 'jasmine']);
	grunt.registerTask('test', ['wrap', 'jasmine']);
};