var gulp = require('gulp');
var fs = require('fs');
var request = require('request');


var SERVER_URL = process.env.SERVER_URL;

var URL = [
    SERVER_URL,
    'api/metadata/typescriptentities'
].join('/');

var CLIENT = process.env.UNI_CLIENT || 'jorgeas';

module.export = gulp.task('entities', function(done) {

    if (!SERVER_URL) {
        console.log('You need to specify the server url before the command:')
        console.log('windows:       `set SERVER_URL=https://devapi.unieconomy.no&&gulp entities`');
        console.log('git_bash/unix: `export SERVER_URL=https://devapi.unieconomy.no && gulp entities`');
        process.exit(1);
    }

    request({
        url: URL,
        headers: {
            'client': CLIENT
        }
    }, function(error, response, body) {
        console.log(URL);
        error ? done(error) : fs.writeFile('./src/app/unientities.ts', body, done);
    });
});

gulp.task('unientities', ['entities']); // alias
