## Grunt support

For running test using [Grunt](http://gruntjs.com/) task runner you can use the following `Gruntfile.js` as template. [More details](http://nightwatchjs.org/guide#using-grunt)

```javascript
// Gruntfile.js
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
```
