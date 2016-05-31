var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

var files = [
    // 3RD PARTY LIBS
    require.resolve('jquery/dist/jquery.min.js'),
    require.resolve('bootstrap/dist/js/bootstrap.min.js'),
    require.resolve('jwt-decode/build/jwt-decode.min.js'),
    require.resolve('lodash/lodash.min.js'),
    require.resolve('accounting/accounting.min.js'),
    require.resolve('../kendo/js/kendo.all.min.js'),

    // STIMULSOFT
    require.resolve('../stimulsoft/Js/stimulsoft.reports.js'),
    //require.resolve('./stimulsoft/Js/stimulsoft.viewer.js'),

    /// MOMENT
    require.resolve('moment/moment.js'),
    require.resolve('moment/locale/en-gb.js'),
    require.resolve('moment/locale/nb.js'),

    // Unitable
    require.resolve('immutable/dist/immutable.min.js'),

    // ANGULAR2 DEPENDENCIES
    require.resolve('systemjs/dist/system-polyfills.js'),
    require.resolve('es6-shim/es6-shim.js'),
    require.resolve('reflect-metadata/Reflect.js'),
    require.resolve('systemjs/dist/system.src.js'),
    require.resolve('zone.js/dist/zone.js'),
    require.resolve('rxjs/bundles/Rx.min.js')
];

gulp.task('vendors', function() {
    gulp.src(files)
        .pipe(plugins.concat('vendors.bundle.js'))
        .pipe(gulp.dest('./dist'))
});