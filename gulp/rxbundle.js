const gulp = require('gulp');
const plugins = require('gulp-load-plugins')({
    lazy: true
});
const Builder = require("systemjs-builder");

function bundle(done) {
    // SystemJS build options.
    var options = {
        normalize: true,
        runtime: false,
        sourceMaps: true,
        sourceMapContents: true,
        minify: true,
        mangle: false
    };
    var builder = new Builder('./');
    builder.config({
        paths: {
            "n:*": "node_modules/*",
            "rxjs/*": "node_modules/rxjs/*.js"
        },
        map: {
            "rxjs": "n:rxjs"
        },
        packages: {
            "rxjs": {main: "Rx.js", defaultExtension: "js"}
        }
    });

    builder.bundle('rxjs', 'node_modules/.tmp/Rx.js', options)
        .then(function(){
            done();
        })
        .catch(function (error) {
            console.error("rxbundle task error: ", error);
        });
}

gulp.task('rxbundle', function (done) {
    // to avoid bundle again if file exists
    try {
        require('.tmp/Rx');
        done();
    } catch (e) {
        bundle(done);
    }


});
