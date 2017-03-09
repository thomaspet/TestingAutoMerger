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
    },
    'lodash': {
        main: 'index.js',
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

var ngRxPackages = [
    'core', 'store', 'effects'
];

ngRxPackages.forEach(function(element) {
    packages['@ngrx/' + element] = { main: 'bundles/' + element + '.min.umd.js', defaultExtension: 'js', format: 'cjs' };
});

// Cache busting for the systemjs lazy loaded modules
var systemLocate = System.locate;
System.locate = function (load) {
    var endsWith = function(a, b){ return a.indexOf(b, a.length - b.length) !== -1; };
    if (!endsWith(load.name, 'stimulsoft.reports.js')){
        load.name = load.name + '?cache-bust=' + APP_VERSION;
    }
    return systemLocate.call(this, load);
};

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
