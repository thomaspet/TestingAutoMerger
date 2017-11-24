const path = require('path');
var file_system = require('fs');
var archiver = require('archiver');

const project_root = path.resolve(__dirname, '..');

var output = file_system.createWriteStream('dist.zip');
var archive = archiver('zip');

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err){
    throw err;
});

const distPath = `${path.join(project_root, 'dist/**/*')}`;
archive.pipe(output);
archive.directory(path.join(project_root, 'dist'), '');
archive.finalize();