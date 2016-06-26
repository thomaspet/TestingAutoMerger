/** User packages configuration. */
var packages = {
    'unitable-ng2': {
        main: 'main',
        defaultExtension: 'js'
    }
};

var ngPackageNames = [
    'common',
    'compiler',
    'core',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router',
    'router-deprecated',
    'upgrade'];

ngPackageNames.forEach(function (element) {
    packages['@angular/' + element] = { main: element + '.umd.js', defaultExtension: 'js' };
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