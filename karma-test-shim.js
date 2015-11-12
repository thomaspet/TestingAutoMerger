// Tun on full stack traces in errors to help debugging
Error.stackTraceLimit=Infinity;


jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;

// // Cancel Karma's synchronous start,
// // we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function() {};

System.warnings = true;
System.config({
    packages: {
        framework: {
            defaultExtension: 'js'
        },
        app: {
            defaultExtension: 'js'
        }
    },
    paths: {
        'framework/*': '/base/dist/framework/*',
        'app/*': '/base/dist/app/*'
    }
});

System.import('angular2/src/core/dom/browser_adapter').then(function(browser_adapter) {
    browser_adapter.BrowserDomAdapter.makeCurrent();
})
.then(function() {
    return Promise.all(
        Object.keys(window.__karma__.files) // All files served by Karma.
            .filter(onlySpecFiles)
            .map(function(moduleName) {
                // loads all spec files via their global module names (e.g. 'base/src/app/hero.service.spec')
                return System.import(moduleName);
            }));
})
.then(function() {
    __karma__.start();
}, function(error) {
    __karma__.error(error.stack || error);
});


function onlySpecFiles(path) {
    return /\.test\.js$/.test(path);
}