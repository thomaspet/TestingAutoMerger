const fs = require('fs-extra');

const THEME_FOLDERS = [
    { message: 'UE', value: 'ue' },
    { message: 'SoftRig', value: 'softrig' },
    { message: 'SR-Bank', value: 'ext01' },
    { message: 'DNB', value: 'ext02' },
];

const ENVIRONMENTS = [
    {
        message: 'Dev',
        value: {
            envFile: 'dev.json',
            proxyUrl: 'https://devapi.unieconomy.no'
        }
    },
    {
        message: 'RC',
        value: {
            envFile: 'rc.json',
            proxyUrl: 'https://rc-api.unieconomy.no'
        }
    },
    {
        message: 'Prod',
        value: {
            envFile: 'prod.json',
            proxyUrl: 'https://pilot-api.unieconomy.no'
        }
    },
    {
        message: 'Local',
        value: {
            envFile: 'local.json',
            proxyUrl: 'http://localhost:29077'
        }
    },
    {
        message: 'Softrig',
        value: {
            envFile: 'softrig.json',
            proxyUrl: 'https://test-api.softrig.com'
        }
    },
    {
        message: 'Ext01',
        value: {
            envFile: 'ext01.json',
            proxyUrl: 'https://ext01-api.unieconomy.no'
        }
    },
    {
        message: 'Ext01 RC',
        value: {
            envFile: 'ext01-rc.json',
            proxyUrl: 'https://rcext01-api.unieconomy.no'
        }
    },
    {
        message: 'Ext02',
        value: {
            envFile: 'ext02.json',
            proxyUrl: 'https://api.dnbregnskap.dnb.no'
        }
    },
    {
        message: 'Ext02 RC',
        value: {
            envFile: 'ext02-rc.json',
            proxyUrl: 'https://api.bruno.dnbbank.no'
        }
    },
    {
        message: 'Ext03-poc01',
        value: {
            envFile: 'ext03-poc01.json',
            proxyUrl: 'https://poc01-api.softrig.com'
        }
    }
];

function ensureDistFolderExists() {
    if (!fs.existsSync('./src/config/dist')) {
        fs.mkdirSync('./src/config/dist');
    }
}

function writeProxyFile(proxyUrl) {
    ensureDistFolderExists();
    fs.writeFileSync('./src/config/dist/proxy.json', JSON.stringify({
        "/api": {
            "target": proxyUrl,
            "secure": false,
            "changeOrigin": true
        }
    }));
}

function copyFiles(themeFolder, envFile) {
    try {
        ensureDistFolderExists();
        fs.copySync(`./src/config/themes/${themeFolder}`, './src/config/dist/theme');
        fs.copyFileSync(`./src/config/environments/${envFile}`, './src/config/dist/env.json');
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {THEME_FOLDERS, ENVIRONMENTS, copyFiles, writeProxyFile}