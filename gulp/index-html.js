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
        const stats = fs.statSync(head);
        
        // In prod, .git/HEAD will contain the revision, not a file path
        if (!stats || !stats.isFile()) {
            return head;
        }

        const headPath = head.split(' ')[1];
        const commit = fs.readFileSync('.git/' + headPath).toString().trim();
        return commit;    
    } catch (e) {
        console.log('WARNING: Gulp command needs to be run at root level for verioning to work');
        return null;
    }
    
}