var fs = require('fs');
var request = require('sync-request');

var SERVER_URL = process.env.SERVER_URL;

var URL = [
  SERVER_URL,
  'api/metadata/typescriptentities'
].join('/');

var CLIENT = process.env.UNI_CLIENT || 'jorgeas';

if (!SERVER_URL) {
  console.log('You need to specify the server url before the command:')
  console.log('windows:       `set SERVER_URL=https://devapi.unieconomy.no&&yarn entities`');
  console.log('git_bash/unix: `export SERVER_URL=https://devapi.unieconomy.no&&yarn entities`');
  process.exit(1);
}

try {
  var response = request('GET', URL, {
    headers: {
      'client': CLIENT
    }
  });
  fs.writeFileSync('./src/app/unientities.ts', response.getBody('utf8'));
} catch(e) {
  console.error('Error downloading unientities');
  console.error(e);
  process.exit(1);
}
process.exit(0);
