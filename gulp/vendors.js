var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

var jsFiles = [
    // 3RD PARTY LIBS
    require.resolve('jquery/dist/jquery.min.js'),
    require.resolve('bootstrap/dist/js/bootstrap.min.js'),
    require.resolve('jwt-decode/build/jwt-decode.min.js'),
    require.resolve('lodash/lodash.min.js'),
    require.resolve('accounting/accounting.min.js'),
    require.resolve('../kendo/js/kendo.all.min.js'),

    /// MOMENT
    require.resolve('moment/moment.js'),
    require.resolve('moment/locale/en-gb.js'),
    require.resolve('moment/locale/nb.js'),

    // CHART.JS
    // Dependant on Moment.js, which is why it sorts on its own,
    // instead of under 3rd pty libs.
    require.resolve('chart.js/dist/Chart.min.js'),

    // Unitable
    require.resolve('immutable/dist/immutable.min.js'),

    // ANGULAR2 DEPENDENCIES
    require.resolve('core-js/client/shim.min.js'),
    require.resolve('zone.js/dist/zone.js'),
    require.resolve('reflect-metadata/Reflect.js'),

    require.resolve('systemjs/dist/system-polyfills.js'),
    require.resolve('systemjs/dist/system.src.js'),
    require.resolve('es6-shim/es6-shim.js'),

    require.resolve('rxjs/bundles/Rx.min.js')
];

var cssFiles = [
    require.resolve('../kendo/styles/kendo.common.min.css')
];

gulp.task('vendors', ['vendors.js', 'vendors.css'])

gulp.task('vendors.js', function() {
    gulp.src(jsFiles)
        .pipe(plugins.concat('vendors.bundle.js'))
        .pipe(gulp.dest('./dist'))
});

gulp.task('vendors.css', function() {
    gulp.src(cssFiles)
        .pipe(plugins.concat('vendors.bundle.css'))
        .pipe(gulp.dest('./dist'))
});