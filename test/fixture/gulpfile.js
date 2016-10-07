const gulp = require('gulp')
const nightwatch = require('gulp-nightwatch')

gulp.task('default', () => {
  return gulp.src('')
    .pipe(nightwatch({
      configFile: 'nightwatch.conf.js'
    }))
})
