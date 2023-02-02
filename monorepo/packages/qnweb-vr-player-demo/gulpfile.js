const gulp = require('gulp');
const changed = require('gulp-changed');
const uglify = require('gulp-uglify');
const rimraf = require('rimraf');
const execSync = require('child_process').execSync;

const SRC = 'src/';
const DEST = 'libs';

gulp.task('build', cb => {
  gulp.series('clean', 'dist')(cb);
});

gulp.task('dist', (cb) => {
  execSync('mkdir dist', { stdio: 'inherit' });
  execSync('cp -r examples dist', { stdio: 'inherit' });
  execSync('cp -r index.html dist', { stdio: 'inherit' });
  execSync('cp -r libs dist', { stdio: 'inherit' });
  cb();
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
