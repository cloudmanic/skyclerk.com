var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cacheBreak = require('gulp-cache-break');

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

// Break browser cache
gulp.task('cache-break', function() {
	// CSS
  gulp.src(['templates/layouts/_main.html'])
    .pipe(cacheBreak({ match: ['style.css'] }))
    .pipe(gulp.dest('templates/layouts/'));

	// JS
	gulp.src(['templates/layouts/_main.html'])
		.pipe(cacheBreak({ match: ['app.js'] }))
		.pipe(gulp.dest('templates/layouts/'));
});

// Watch
gulp.task('watch', function () {
  gulp.watch('resources/js/*.js', ['js', 'cache-break' ]);
  gulp.watch('resources/css/*.css', ['css', 'cache-break']);
});

// Default task
gulp.task('default',['js', 'css', 'images', 'fonts', 'cache-break'], function() {});
