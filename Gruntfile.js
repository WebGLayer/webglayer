module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    concat : {
    	  dist1 : {
    	    src  : [
            'src/WGL.js',
            'src/**/*.js'
            ],
    	    dest : 'build/main.js'
    	  },
        dist2 : {
          src  : [
            'examples/libs/jquery.csv.min.js',
            'build/uglf.js'
          ],
          dest : 'build/<%= pkg.name %>.min.js'
        }
    	},

    babel: {
      options: {
        sourceMap: true,
        presets: [
          ['@babel/preset-env', {modules: false}],
        ]
      },
      dist: {
        files: {
          'build/main_es5.js': 'build/main.js'
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        mangle:true
      },
      build: {
        src: [
          'build/main_es5.js'
        ],
        dest: 'build/uglf.js'
      }
    },
    	
    jsdoc : {
      dist : {
        src: ['src/*'],
        options: {
            destination: 'doc'
        }
      }
    },
    umd : {
      all : {
        options : {
          src : 'build/main.js',
          objectToExport : 'WGL',
          deps : {
            'default' : ['d3', {jquery : '$'}, 'tooltipster'],
            'global' : ['d3', {jQuery : '$'}, 'tooltipster']
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('default', ['concat:dist1','babel', 'umd', 'uglify', 'concat:dist2']);

};
