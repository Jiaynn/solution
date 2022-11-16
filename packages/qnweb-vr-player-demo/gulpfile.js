const gulp = require('gulp');
const changed = require('gulp-changed');
const uglify = require('gulp-uglify');
const rimraf = require('rimraf');
const execSync = require('child_process').execSync;

const SRC = 'src/';
const DEST = 'dist/js';

gulp.task('build', cb => {
  gulp.series('clean', 'libs', 'examples', 'html')(cb);
});

gulp.task('dev', () => {
  gulp.watch(['examples', 'index.html'], cb => {
    gulp.series('examples', 'html')(cb);
  });
});

gulp.task('libs', () => {
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

gulp.task('clean', cb => {
  rimraf('dist', cb);
});

gulp.task('examples', cb => {
  execSync('cp -r examples dist', { stdio: 'inherit' });
  cb();
});

gulp.task('html', cb => {
  execSync('cp -r index.html dist', { stdio: 'inherit' });
  cb();
});
