const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');

console.log(colors.green('\nGenerating app metadata and raygun setup'));

let raygunSetup;
if (process.env.RAYGUN_API_KEY) {
    raygunSetup = `
        rg4js("apiKey", "${process.env.RAYGUN_API_KEY}");
        rg4js("enableCrashReporting", true);
        rg4js("setVersion", "${getGitRevision()}");
    `.trim();
} else {
    raygunSetup = '/* no raygun api key provided (environment variable) */';
}

const metadata = `
// Generated by scripts/prebuild.js
// Any changes done to this file will disappear on build
export const APP_METADATA = {
    APP_VERSION: '${getGitRevision()}',
    APP_BUILD_DATE: '${new Date().toISOString()}',
    GIT_REVISION: '${getGitRevision()}',
};
`;

const project_root = path.resolve(__dirname, '..');

// Write raygunsetup file
const raygunSetupPath = path.join(project_root, 'src/raygun-setup.js');
fs.writeFile(raygunSetupPath, raygunSetup, { flat: 'w' }, function (err) {
    if (err) {
        return console.log(colors.red(err));
    }

    console.log(colors.cyan('> Done generating raygun setup'));
});


// Write metadata file
const metadataFilePath = path.join(project_root, 'src/environments/metadata.ts');
fs.writeFile(metadataFilePath, metadata, { flat: 'w' }, function (err) {
    if (err) {
        return console.log(colors.red(err));
    }

    console.log(colors.cyan('> Done generating metadata'));
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
        console.log('WARNING: Something went wrong when checking git revision in script task environment.js');
        console.log(e);
        return '';
    }
}