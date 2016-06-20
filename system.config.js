/** User packages configuration. */
var packages = {
    'unitable-ng2': {
        main: 'main',
        defaultExtension: 'js'
    }
};

var barrels = [
    // Angular specific barrels.
    '@angular/core',
    '@angular/common',
    '@angular/compiler',
    '@angular/http',
    '@angular/router',
    '@angular/router-deprecated',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
];
var cliSystemConfigPackages = {};
barrels.forEach(function(barrelName) {
    cliSystemConfigPackages[barrelName] = {
        main: 'index'
    };
});

// Apply the CLI SystemJS configuration.
System.config({
    packages: cliSystemConfigPackages,
});

// Apply the user's configuration.
System.config({
    packages: packages
});

// stimulsoft configuration
System.config({
    meta: {
        'stimulsoft.reports.js': {
            format: 'global',
            exports: 'Stimulsoft'
        }
    }
});