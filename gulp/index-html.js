var gulp = require('gulp');
const fs = require('fs');

var plugins = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('index.html.dev', ['ts2js.dev', 'sass2css', 'vendors'], function() {
    var manifest = gulp.src("./dist/rev-manifest.json");
    return gulp.src('./src/index.html')
        .pipe(plugins.template({
            version: (new Date()).getTime(),
            environment: 'development',
            gitRevision: getGitRevision()
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('index.html', ['ts2js', 'sass2css', 'vendors'], function() {
    var manifest = gulp.src("./dist/rev-manifest.json");
    return gulp.src('./src/index.html')
        .pipe(plugins.template({
            version: (new Date()).getTime(),
            environment: 'production',
            gitRevision: getGitRevision()
        }))
        .pipe(gulp.dest('./dist'));
});


function getGitRevision() {
    const GIT_HEAD_FILE = '.git/HEAD';
    try {
        const head = fs.readFileSync(GIT_HEAD_FILE).toString().trim();
        
        // In prod, .git/HEAD will contain the revision, not a file path
        if (head.indexOf('/') >= 0) {
            const headPath = head.split(' ')[1];
            const commit = fs.readFileSync('.git/' + headPath).toString().trim();
            return commit;
        } else {
            return head;
        }
        
    } catch (e) {
        console.log('WARNING: Something went wrong when checking git revision in gulp task index.html');
        return null;
    }
    
}