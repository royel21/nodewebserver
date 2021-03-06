const gulp = require('gulp')
const concat = require('gulp-concat')
const minify = require('gulp-minify')
const cleanCss = require('gulp-clean-css')
const del = require('del')

var csslib = './public/static/lib/css/*.css';
var homecss = './public/static/css/';
var jslib = './public/static/lib/js/';
var jslibs = [jslib + 'jquery.min.js', jslib + 'socket.io.slim.js']
var homePath = './public/static/js/home/';
var adminPath = './public/static/js/admin/';


gulp.task('login-css', function() {
    return gulp.src(
            [
                './public/static/lib/css/bootstrap.min.css',
                homecss + 'index.css',
                homecss + 'login.css'
            ])
        .pipe(concat('login.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('login-js', function() {
    return gulp.src([homePath + "/login.js"]).pipe(concat('login.js'))
        .pipe(minify({
            ext: {
                min: '.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('home-css', function() {
    return gulp.src(
            [
                csslib,
                homecss + 'home.css',
                homecss + 'nav-menu.css',
                homecss + 'modal.css',
                homecss + 'index.css',
                homecss + 'fullscreen.css',
                homecss + 'manga-viewer.css',
                homecss + 'videoplayer.css',
                homecss + 'sliders.css',
                homecss + 'footer.css'
            ])
        .pipe(concat('home.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('public/css/'));
});


gulp.task('home-js', function() {
    return gulp.src(
            jslibs.concat(
                './public/static/js/util.js',
                './public/static/js/main.js',
                homePath + "file-list.js",
                homePath + "sliders.js",
                homePath + "manga-viewer.js",
                homePath + "player.js",
                homePath + "move-element.js"
            )).pipe(concat('home.js'))
        .pipe(minify({
            ext: {
                min: '.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('admin-css', function() {
    return gulp.src(
            [
                csslib,
                homecss + 'nav-menu.css',
                homecss + 'index.css',
                homecss + 'admin.css',
                homecss + 'modal.css',
                homecss + 'tree-view.css',
                homecss + 'folders.css'
            ])
        .pipe(concat('admin.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('admin-js', function() {
    return gulp.src(
            jslibs.concat(
                './public/static/js/util.js',
                './public/static/js/main.js',
                adminPath + "folders.js",
                adminPath + "files.js",
                adminPath + "directories.js",
                adminPath + "admin.js"
            )).pipe(concat('admin.js'))
        .pipe(minify({
            ext: {
                min: '.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('clean', () => {
    return del(['./public/css/*.css', './public/js/*.js'])
});

gulp.task('error-css', function() {
    return gulp.src(
            [
                './public/static/lib/css/bootstrap.min.css',
                homecss + 'index.css',
                homecss + 'error.css'
            ])
        .pipe(concat('error.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('default',
    gulp.series(
        'clean',
        'home-css',
        'home-js',
        'login-css',
        'login-js',
        'admin-css',
        'admin-js',
        'error-css'
    ));