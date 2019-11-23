const gulp = require('gulp')
const concat = require('gulp-concat')
const minify = require('gulp-minify')
const cleanCss = require('gulp-clean-css')
const del = require('del')

var csslib = './static/lib/css/*.css';
var homecss = './static/css/';
var jslib = './static/lib/js/';
var jslibs = [jslib + 'jquery.min.js', jslib + 'popper.min.js', jslib + 'bootstrap.min.js', jslib + 'socket.io.slim.js']
var util = './static/js/util.js'
var homePath = './static/js/home/';
var adminPath = './static/js/admin/';


gulp.task('login-css', function () {
    return gulp.src(
        [
            csslib,
            homecss + 'nav-menu.css',
            homecss + 'index.css',
            homecss + 'login.css'
        ])
        .pipe(concat('login.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('login-js', function () {
    return gulp.src(
        jslibs.concat(
            util,
            homePath + "/login.js"
        )).pipe(concat('login.js'))
        .pipe(minify({
            ext: {
                min: '.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('home-css', function () {
    return gulp.src(
        [
            csslib,
            homecss + 'home.css',
            homecss + 'nav-menu.css',
            homecss + 'index.css',
            homecss + 'fullscreen.css',
            homecss + 'videoplayer.css',
            homecss + "mangaviewer.css",
            homecss + 'sliders.css',
            homecss + 'footer.css'
        ])
        .pipe(concat('home.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('public/css/'));
});


gulp.task('home-js', function () {
    return gulp.src(
        jslibs.concat(
            util,
            homePath + "main.js",
            homePath + "file-list.js",
            homePath + "sliders.js",
            homePath + "player.js",
            homePath + "manga-viewer.js",
            homePath + "move-element.js"
        )).pipe(concat('home.js'))
        // .pipe(minify({
        //     ext: {
        //         min: '.js'
        //     },
        //     noSource: true
        // }))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('admin-css', function () {
    return gulp.src(
        [
            csslib,
            homecss + 'nav-menu.css',
            homecss + 'index.css',
            homecss + 'admin.css',
            homecss + 'modal.css',
            homecss + 'tree-view.css',
            homecss + 'series.css'
        ])
        .pipe(concat('admin.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('admin-js', function () {
    return gulp.src(
        jslibs.concat(
            util,
            homePath + "main.js",
            adminPath + "series.js",
            adminPath + "files.js",
            adminPath + "directories.js",
            adminPath + "admin.js"
        )).pipe(concat('admin.js'))
        // .pipe(minify({
        //     ext: {
        //         min: '.js'
        //     },
        //     noSource: true
        // }))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('clean', () => {
    return del(['./public/css/*.css', './public/js/*.js'])
});

gulp.task('default',
    gulp.series(
        'clean',
        'home-css',
        'home-js',
        'login-css',
        'login-js',
        'admin-css',
        'admin-js'
    ));