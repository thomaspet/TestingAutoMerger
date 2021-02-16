const { copyFiles } = require('./config');

const config = {};

process.argv.slice(2, 4).forEach(arg => {
    let [name, value] = (arg || '').toLowerCase().split('=');
    config[name] = value;
})

if (config.theme && config.env) {
    copyFiles(config.theme, config.env + '.json');
} else {
    console.error('ERROR: set-config script is missing either theme or env');
    process.exit(1);
}
