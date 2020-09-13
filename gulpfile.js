const { src, dest, series, watch } = require('gulp')
const include = require('gulp-file-include')
const concat =  require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const csso = require('gulp-csso')
const del = require('del')
const htmlmin = require('gulp-htmlmin')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const webp = require('gulp-webp')
const webpHtml = require('gulp-webp-html')
const webpCss = require('gulp-webp-css')
const browserSync = require('browser-sync').create()

function html() {
    return src('src/**/*.html')
        .pipe(include({
            prefix: '@@'
        }))
        .pipe(webpHtml())
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest('dist/'))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'src/js/index.js'
    ])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(dest('dist/js/'))
        .pipe(browserSync.stream())
}

function styles() {
    return src('src/scss/index.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(csso())
        .pipe(concat('index.min.css'))
        .pipe(webpCss())
        .pipe(dest('dist/css/'))
        .pipe(browserSync.stream())
}

function clear() {
    return del('dist')
}

function images() {
    return src('src/img/**/*')
        .pipe(newer('dist/img/'))
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest('dist/img/'))
        .pipe(src('src/img/**/*'))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3
        }))
        .pipe(dest('dist/img/'))
        .pipe(browserSync.stream())
}

function browsersync() {
    browserSync.init({
        server: 'dist/',
        notify: false,
    })

    watch('src/**.html', series(html)).on('change', browserSync.reload)
    watch('src/js/**/*.js', scripts)
    watch('src/scss/**.scss', styles)
    watch('src/img/**/*', images)
}

// exports.browsersync = browsersync
// exports.html = html
// exports.scripts = scripts
// exports.styles = styles
// exports.clear = clear

exports.build = series(clear, styles, images, scripts, html)
exports.watch = series(clear, styles, images, scripts, html, browsersync)