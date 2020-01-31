var fs = require('fs');
var request = require('sync-request');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter api url (leave blank for dev): \n> ', function(endpoint) {
  endpoint = endpoint || 'https://devapi.unieconomy.no';

  rl.question("\nEnter valid token (without Bearer): \n> ", function(token) {
      rl.question("\nEnter CompanyKey: \n> ", function(key) {
          if (token && key) {
            token = token.replace(/"/g, '');
            key = key.replace(/"/g, '');

            const url = `${endpoint}/api/metadata/typescriptentities`;
            console.log(`\nGetting entities from ${url}\n`);

            try {
              var response = request('GET', url, {
                headers: {
                  'Authorization': `Bearer ${token.trim()}`,
                  'CompanyKey': key.trim()
                }
              });

              fs.writeFileSync('./src/app/unientities.ts', response.getBody('utf8'));
            } catch(e) {
              console.error('Error downloading unientities');
              console.error(e);
              process.exit(1);
            }

          }
          rl.close();
      });
  });

})

rl.on("close", function() {
    process.exit(0);
});