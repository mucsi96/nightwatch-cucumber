## Gulp support

For running test using [Gulp](http://gulpjs.com/) task runner you can use the following `gulpfile.js` as template. [More details](https://github.com/tatsuyafw/gulp-nightwatch)

```javascript
// gulpfile.js
const gulp = require('gulp')
const nightwatch = require('gulp-nightwatch')

gulp.task('default', () => {
  return gulp.src('')
    .pipe(nightwatch({
      configFile: 'nightwatch.conf.js'
    }))
})
```
