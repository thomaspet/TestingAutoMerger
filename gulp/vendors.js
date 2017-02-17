var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

var jsFiles = [
    // 3RD PARTY LIBS
    require.resolve('jquery/dist/jquery.min.js'),
    require.resolve('jwt-decode/build/jwt-decode.min.js'),
    require.resolve('accounting/accounting.min.js'),
    require.resolve('base64-js/base64js.min.js'),

    // file saver
    require.resolve('file-saver/FileSaver.min.js'),

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

    require.resolve('systemjs/dist/system.src.js'),

    // not handled by require since that file is created in a gulp task
    // and could not be available.
    // this file is also temporary until bug with Rx bundle is fixed.
    './node_modules/.tmp/Rx.js'
];

gulp.task('vendors', ['vendors.js']);

gulp.task('vendors.js', ['rxbundle'], function () {
    gulp.src(jsFiles)
        .pipe(plugins.concat('vendors.bundle.js'))
        .pipe(gulp.dest('./dist'))
});
