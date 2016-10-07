const nightwatch = require('nightwatch')

module.exports = (grunt) => {
  grunt.initConfig({
    nightwatch: {
      'default': {
        argv: {}
      }
    }
  })

  nightwatch.initGrunt(grunt)

  grunt.registerTask('default', ['nightwatch'])
}
