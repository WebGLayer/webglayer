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
    	
    	
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        mangle:true
      },
      build: {
        src: 'build/main.js',
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
    	    },
    qunit: {
        all: ['test/**/*.html']
      }
  });

  // Load the plugin that provides the "uglify" task.''
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-jsdoc');
  // Default task(s).
  grunt.registerTask('default', ['concat','uglify']);

};