var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});
var rimraf = require('rimraf');
var runSequence = require('run-sequence');
var connect = require('gulp-connect');
var request = require('request');
var fs = require('fs');
var VERSION = new Date().getTime();
var tslint = require('gulp-tslint');

var config = {
    typescript: {
        target: "ES5",
        module: "system",
        moduleResolution: "node",
        sourceMap: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        removeComments: false,
        noImplicitAny: false,
        sortOutput: true
    },
    src: {
        assets: './src/assets/**/*',
        app: {
            ts: './src/**/*.ts',
            html: './src/**/*.html',
            css: './src/**/*.css',
            sass: './src/styles/main.sass'
        },
        index: './src/index.template.html',
        vendor: {
            js: [
                // 3RD PARTY LIBS
                require.resolve('jquery/dist/jquery.min.js'),
                require.resolve('bootstrap/dist/js/bootstrap.min.js'),
                require.resolve('jwt-decode/build/jwt-decode.min.js'),
                require.resolve('lodash/lodash.min.js'),
                require.resolve('./kendo/js/kendo.all.min.js'),

                // STIMULSOFT
                require.resolve('./stimulsoft/Js/stimulsoft.reports.js'),
                require.resolve('./stimulsoft/Js/stimulsoft.viewer.js'),

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
            ],
            angular: [
                // Angular specific barrels.
                './node_modules/@angular/core',
                './node_modules/@angular/common',
                './node_modules/@angular/compiler',
                './node_modules/@angular/http',
                './node_modules/@angular/router',
                './node_modules/@angular/router-deprecated',
                './node_modules/@angular/platform-browser',
                './node_modules/@angular/platform-browser-dynamic',

                // Thirdparty barrels.
                './node_modules/rxjs',
            ],
            
            //rxjs: './node_modules/rxjs/**/*.js' ,
            css: [
                require.resolve('./kendo/styles/kendo.common.min.css')
            ]
        }
    },
    dist: {
        index: './dist/index.html',
        folder: './dist',
        angular2: './dist/angular2',
        unitable: './dist/unitable-ng2',
        assets: './dist/assets',
        maps: '.',
        appFiles: ['./dist/**/*.js', './dist//**/*.css', './dist/**/*.html'],
        vendor: {
            js: 'vendor.js',
            css: 'vendor.css'
        }
    }
};

/********************/
/*    LINT CODE     */
/********************/
gulp.task('tslint', function() {
    const lintSource = gulp.src([
        './src/**/*.ts',
        '!./src/framework/validators/**',
        '!./src/framework/interfaces/interfaces.ts',
        '!./src/app/unientities.ts'
    ]);

    return lintSource
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            emitError: false,
            summarizeFailureOutput: true
        }));
    // .pipe(tslint.report('verbose'));


    // return gulp.src('./src/**/*.ts')
    //     .pipe(tslint())
    //     .pipe(tslint.report('verbose'));
});

/********************/
/*  CLEANING TASKS  */
/********************/
gulp.task('clean', function(done) {
    rimraf(config.dist.folder, done);
});

/********************/
/*  BUILDING TASKS  */
/********************/

gulp.task('entities', function(done) {
    var options = {
        //url: 'http://localhost:27831/api/metadata/typescriptentities',
        url: 'https://devapi-unieconomy.azurewebsites.net/api/metadata/typescriptentities',
        headers: {
            'client': 'jorgeas'
        }
    };
    var callback = function(error, response, body) {
        fs.writeFileSync('./src/app/unientities.ts', body);
        done();
    };
    request(options, callback);
});

// gulp.task('rxjs' , ['web.config', 'entities'] , function () {
//    return gulp.src('./node_modules/rxjs/**/*.js')
//        .pipe(gulp.dest('./dist/lib/rxjs'));
// });

gulp.task('angular2', ['system.config'], function(done) {
    config.src.vendor.angular.forEach((item) => {
        var folders = item.split('/');
        gulp.src(item + '/**/*').pipe(gulp.dest(config.dist.angular2 + '/' + folders[folders.length - 1]));
    });
    return done();
});

gulp.task('unitable', function() {
   return gulp.src([
       './node_modules/unitable-ng2/**/*',
       '!./node_modules/unitable-ng2/node_modules/**/*'
   ])
   .pipe(gulp.dest(config.dist.unitable)); 
});

gulp.task('system.config', function() {
    return gulp.src('./system.config.js')
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('web.config', function() {
    return gulp.src('./web.config')
        .pipe(gulp.dest('./dist'));
});

gulp.task('build.dist.vendor.js', [ /*'rxjs'*/ 'angular2', 'unitable'], function() {
    return gulp.src(config.src.vendor.js)
        .pipe(plugins.plumber())
        .pipe(plugins.concat(config.dist.vendor.js))
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.vendor.css', ['build.dist.main.css.map'], function() {
    return gulp.src(config.src.vendor.css)
        .pipe(plugins.plumber())
        .pipe(plugins.concat(config.dist.vendor.css))
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.compile.sass', function() {
    return plugins.rubySass(config.src.app.sass)
        .on('error', plugins.rubySass.logError)
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.main.css.map', ['build.dist.compile.sass'], function() {
    return gulp.src('./src/styles/main.css.map')
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.app.typescript', function() {
    return gulp.src(config.src.app.ts)
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init({
            loadMaps: true
        }))
        .pipe(plugins.typescript(config.typescript))
        //.pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write(config.dist.maps))
        .pipe(gulp.dest(config.dist.folder))
});

gulp.task('build.dist.app.html', function() {
    return gulp.src(config.src.app.html)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(config.dist.folder))
});

gulp.task('build.dist.app.css', function() {
    return gulp.src(config.src.app.css)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(config.dist.folder))
});

gulp.task('build.dist.assets', function() {
    return gulp.src(config.src.assets)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(config.dist.assets))
});

gulp.task('build.dist.app', function(done) {
    runSequence('build.dist.app.typescript', 'build.dist.app.html', 'build.dist.app.css', done);
});

gulp.task('build.dist.copy.from.src.index.template', function() {
    return gulp.src(config.src.index)
        .pipe(plugins.rename('index.html'))
        .pipe(gulp.dest(config.dist.folder));
});
gulp.task('build.dist.fill.index.template', function() {
    return gulp.src(config.dist.index)
        .pipe(plugins.template({
            VERSION: VERSION
        }))
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist', function(done) {
    runSequence(
        'entities',
        'build.dist.vendor.js',
        'build.dist.vendor.css',
        'build.dist.app',
        'build.dist.copy.from.src.index.template',
        'build.dist.fill.index.template',
        'build.dist.assets',
        done);
});

gulp.task('watch', function() {
    gulp.watch(config.src.app.ts, ['build.dist.app.typescript'])
    gulp.watch(config.src.app.html, ['build.dist.app.html'])
    gulp.watch('./src/**/*.sass', ['build.dist.compile.sass'])
    return gulp.watch(config.src.app.css, ['build.dist.app.css']);

});

gulp.task('serve', function() {
    return connect.server({
        //livereload: true ,
        root: 'dist',
        port: 3000
    });
});
/*
gulp.task('livereload' , function () {
    return gulp.src(config.dist.appFiles);
        //.pipe(plugins.watch(config.dist.appFiles))
        //.pipe(connect.reload())
});
*/
gulp.task('build.watch.and.serve', function(done) {
    runSequence('clean', 'build.dist', 'serve', 'watch', done);
});

gulp.task('test', function() {
    return gulp.src('tests.html')
        .pipe(
            plugins.inject(gulp.src(['./src/**/*.spec.ts'], {
                read: false
            }), {
                starttag: '<!-- inject:spec -->',
                endtag: '<!-- endinject -->',
                transform: function(filepath, file) {
                    return "System.import('" + filepath + "'),\r\n";
                }
            }))
        .pipe(gulp.dest('./'))
});

gulp.task('serve.tests', ['test'], function() {
    return connect.server({
        livereload: false,
        root: './',
        port: 9999
    });
});