var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');

// Build CSS
gulp.task('css', function() {
   gulp.src([ 'resources/css/style.css', 'resources/css/app.css' ] )
   .pipe(concat('style.css'))
   .pipe(minify())
   .pipe(gulp.dest('web/assets/css/'));
});

// Build JS
gulp.task('js', function() {
   gulp.src('resources/js/*.js')
   .pipe(concat('app.js'))
   .pipe(uglify())
   .pipe(gulp.dest('web/assets/js/'));
});

// Build fonts
gulp.task('fonts', function() {
   gulp.src('resources/fonts/*')
   .pipe(gulp.dest('web/assets/fonts/'));
});

// Build images
gulp.task('images', function() {

	gulp.src('resources/images/*')
		.pipe(imagemin())
		.pipe(gulp.dest('web/assets/images/'));

	gulp.src('resources/images/temp/SVGs/*')
		.pipe(imagemin())
		.pipe(gulp.dest('web/assets/images/temp/SVGs/'));

	gulp.src('resources/images/temp/*')
		.pipe(imagemin())
		.pipe(gulp.dest('web/assets/images/temp/'));

  gulp.src('resources/images/people/*')
    .pipe(imagemin())
    .pipe(gulp.dest('web/assets/images/people/'));
});

// Watch
gulp.task('watch', function () {
  gulp.watch('resources/js/*.js', ['js']);
  gulp.watch('resources/css/*.css', ['css']);
});

// Default task
gulp.task('default',['js', 'css', 'images', 'fonts'], function() {});
