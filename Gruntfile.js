module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      dist: {
        expand: true, cwd: 'src/', src: ['**'], dest: 'dist/'
      },
      site: {
        expand: true, cwd: 'dist/', src: ['**'], dest: 'site/'
      }
    }, 
    // Lint definitions
    jshint: {
      all: ["src/**.js"],
      options: {
        jshintrc: ".jshintrc"
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': [ 'dist/<%= pkg.name %>.js'],
          'dist/jquery.<%= pkg.name %>.min.js': [ 'dist/jquery.<%= pkg.name %>.js']
        }
      }
    },
    browserify: {
      dist: {
        options: {
          browserifyOptions: {
            standalone: '<%= pkg.name %>',
            debug: true
          }
        },
        files: {
          'dist/<%= pkg.name %>.js': 'src/<%= pkg.name %>.js'
        }
      },
      'jquery-plugin': {
        files: {
          'dist/jquery.<%= pkg.name %>.js': 'src/jquery.<%= pkg.name %>.js'
        }
      }
    },
    qunit: {
      all: ['test/**/*.html']
    },
    watch: {
      src: {
        files: ["src/**/*"],
        tasks: ['build']
      },
      site: {
        files: ["README.md", "src/**/*"],
        tasks: ['build', 'site']
      }
    },
    connect: {
      builder: { 
        options: {
          open: true,
          base: 'builder',
          directory: 'builder',
          port: 8989,
          //livereload: true,
          keepalive: false,
          index: 'index.html',
          middleware: function(connect) {
           return [
             connect.static('builder'),
             connect().use('/dist/chartr.min.js', connect.static('./dist/chartr.min.js')),
           ];
          }
        }
      },
      site: {
        options: {
          open: true,
          base: 'site',
          directory: 'site',
          port: 9090,
          //livereload: true,
          keepalive: false,
          index: 'index.html'
        }
      }
    },
    livemd: {
      options: {
        prefilter: function(string) {
          return string.replace(grunt.config().pkg && grunt.config().pkg.homepage && new RegExp("\\[.*\\]\\(" + grunt.config().pkg.homepage.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "\\)", "gi"), "");
        }
      },
      site: {
        files: {
          'site/index.html': ['README.md']
        }
      }
    },
    'gh-pages': {
      options: {
        // Options for all targets go here.
      },
      site: {
        options: {
          base: 'site'
        },
        // These files will get pushed to the `gh-pages` branch (the default).
        src: ['**/*']
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-qunit");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-livemd");
  grunt.loadNpmTasks("grunt-gh-pages");
  grunt.loadNpmTasks("grunt-browserify");

  grunt.registerTask('build', ['browserify', 'uglify']);
  
  grunt.registerTask('test', ['build', 'qunit']);
  
  grunt.registerTask('site', ['build', 'copy:site', 'livemd:site']);
  
  grunt.registerTask('serve:site', ['build', 'site', 'connect:site', 'watch:site']);
  grunt.registerTask('serve:builder', ['build', 'connect:builder', 'watch:src']);
};