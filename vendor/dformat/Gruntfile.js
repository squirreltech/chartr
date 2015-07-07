module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      dist: {
        expand: true, cwd: 'src/', src: ['**'], dest: 'dist/'
      },
      site: {
        expand: true, cwd: 'dist/', src: ['**/*'], dest: 'site/'
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
          'dist/dformat.min.js': [ 'dist/dformat.js']
        }
      }
    },
    qunit: {
      all: ['test/**/*.html']
    },
    browserify: {
      dist: {
        options: {
          browserifyOptions: {
            standalone: 'dformat',
            debug: true
          }
        },
        files: {
          'dist/dformat.js': 'src/dformat.js'
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
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-livemd");
  grunt.loadNpmTasks("grunt-gh-pages");

  grunt.registerTask('build', ['browserify', 'uglify']);
  
  grunt.registerTask('test', ['jshint', 'qunit']);
  
  grunt.registerTask('default', ['build', 'test']);
  
  grunt.registerTask('site', ['build', 'copy:site', 'livemd:site']);
};