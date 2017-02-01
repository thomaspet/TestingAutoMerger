/** User packages configuration. */
var packages = {
    'unitable-ng2': {
        main: 'main',
        defaultExtension: 'js'
    },
    'uniform-ng2': {
        main: 'main',
        defaultExtension: 'js'
    },
    'unisearch-ng2': {
        main: 'main',
        defaultExtension: 'js'
    },
    'moment': {
        main: 'moment',
        defaultExtension: 'js'
    }
};

var ngPackageNames = [
    'common',
    'compiler',
    'core',
    'http',
    'forms',
    'platform-browser',
    'platform-browser-dynamic',
    'router',
    'router-deprecated',
    'forms',
    'upgrade'
];

ngPackageNames.forEach(function(element) {
    packages['@angular/' + element] = {
        main: 'bundles/' + element + '.umd.js',
        defaultExtension: 'js'
    };
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
        },
        '*.js': {
            crossOrigin: 'anonymous'
        }
    }
});
