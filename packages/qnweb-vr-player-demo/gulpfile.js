var gulp = require('gulp');
var changed = require('gulp-changed');
var uglify = require('gulp-uglify');
var gulpSequence = require('gulp-sequence');

var SRC = 'src/';
var DEST = 'dist/js';

gulp.task('dist', function () {
    return gulp.src(SRC + '*.js')
        .pipe(changed(DEST))
        .pipe(uglify({
            mangle: true,
            compress: true,
        }))
        .on('error', function (err) {
            console.log(err.toString());
        })
        .pipe(gulp.dest(DEST));
});
