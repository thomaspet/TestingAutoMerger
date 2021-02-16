const fs = require('fs-extra')
const { prompt } = require('enquirer');
const { THEME_FOLDERS, ENVIRONMENTS, copyFiles, writeProxyFile } = require('./config');

console.log();

getUserInput().then(({themeFolder, environment}) => {
    // Create proxy config needed for serving the application locally
    writeProxyFile(environment.proxyUrl);

    // Copy the env and theme files to dist
    copyFiles(themeFolder, environment.envFile);

    // Write path info to a json file so config-watcher.js knows which files to copy on changes
    fs.writeFileSync('./src/config/tmp_watch_config.json', JSON.stringify({
        themeFolder: themeFolder,
        envFile: environment.envFile
    }));

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1)
});

function getUserInput() {
    return prompt([
        {
            type: 'select',
            name: 'themeFolder',
            message: 'Select theme',
            choices: THEME_FOLDERS,
            result() {
                return this.focused.value;
            }
        },
        {
            type: 'select',
            name: 'environment',
            message: 'Select environment config',
            choices: ENVIRONMENTS,
            result() {
                return this.focused.value;
            }
        }
    ]);
};

