'use strict';
const https = require('https');
const fs = require('fs');

const SERVER       = 'raw.githubusercontent.com';
const PATH         = '/unimicro/VideosUniEconomy/master/Info_video_URL_mapping.csv';
const OUTPUT_FILE  = 'src/assets/educational-video-mapping.json';

console.log('Starting UE video mapping');

if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN || !process.env.GITHUB_USERNAME) {
    console.error(
        '> Could not find the GITHUB_USERNAME and GITHUB_PERSONAL_ACCESS_TOKEN '
        + 'environment keys, skipping video-mapping.'
    );

    process.exit(1);
}

const options = {
    hostname: SERVER,
    path: PATH,
    auth: process.env.GITHUB_USERNAME + ':' + process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
    timeout: 200
};

const req = https.request(options);
req.end();

let mappingStrings = "";
req.on('response', function(response) {
    if (response.statusCode < 200 || response.statusCode > 300) {
        console.error(
            `> Got a non 2XX response (${response.statusCode}) when trying to download video mapping JSON.`
        );

        process.exit(1);
    }

    response.on('data', data => mappingStrings += data);
    response.on('end', () => {
        const mappingDictionary = mappingStrings
            .split(/\r?\n/)
            .filter(line => !!line.trim())
            .map(line => splitWithTail(line, ' , ', 1))
            .filter(lineParts => lineParts.length === 2)
            .reduce(toMappingDictionary, {});

        fs.writeFile(OUTPUT_FILE, JSON.stringify(mappingDictionary), function() {
            console.log('> Video mapping done');
            process.exit(0);
        });
    });
});

req.on('error', function(err) {
    console.error(err.message);
    process.exit(1);
});


function toMappingDictionary(output, lineParts) {
    const urlPath = extractPathFromUrl(lineParts[0]);
    if (urlPath) {
        output[urlPath] = lineParts[1];
    }
    return output;
}

// because str.split(';', 2) doesn't work the way you think it does...
function splitWithTail(str,delim,count){
    const parts = str.split(delim);
    const tail = parts.slice(count).join(delim);
    const result = parts.slice(0,count);
    result.push(tail);
    return result;
}

// input ex: https://dev.unieconomy.no/#/accounting/transquery?Account_AccountNumber=2710
// output ex: /accounting/transquery
function extractPathFromUrl(uniEconomyURL) {
    const match = uniEconomyURL.match(/#([^?;&]+)/);
    if (match && match[1]) {
        return match[1].replace(/\d+/, '0');
    }
}