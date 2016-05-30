var gulp = require('gulp');
var fs = require('fs');
var request = require('request');

var SERVER = process.env.SERVER_URL || 'https://devapi-unieconomy.azurewebsites.net';

var URL = [
    SERVER,
    'api/metadata/typescriptentities'
].join('/');

var CLIENT = process.env.UNI_CLIENT || 'jorgeas';

var options = {
    url: URL,
    headers: {
        'client': CLIENT
    }
};

module.export = gulp.task('entities', function(done) {

    var callback = function(error, response, body) {
        fs.writeFileSync('./src/app/unientities.ts', body);
        done();
    };

    request(options, callback);
});