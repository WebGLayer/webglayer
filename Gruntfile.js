module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    concat : {
    	  options : {
    		 
    	  },
    	  dist : {
    	    src  : ['src/WGL.js','src/**/*.js'],
    	    dest : 'build/main.js'
    	  }
    	},

    babel: {
      options: {
        sourceMap: true,
        presets: ['env']
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
        src: 'build/main_es5.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    	
    jsdoc : {
      dist : {
        src: ['src/*'],
        options: {
            destination: 'doc'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('default', ['concat','babel', 'uglify']);

};