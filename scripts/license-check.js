const checker = require('license-checker');
const colors = require('colors/safe');

console.log(colors.green('\nChecking licenses..'));

checker.init({
    start: './',
    production: true
}, function(err, json) {
    if (err) {
        console.log(colors.red(err));
        process.exit(1);
    } else {
        const packagesByLicense = orderPackagesByLicense(json);
        logResults(packagesByLicense);
        process.exit(0);
    }
});

function orderPackagesByLicense(packages) {
    let packagesByLicense = {};
    let packageKeys = Object.keys(packages);

    packageKeys.forEach(function(key) {
        let licenseName = packages[key].licenses;
        if (!packagesByLicense[licenseName]) {
            packagesByLicense[licenseName] = [];
        }

        packagesByLicense[licenseName].push(key);
    });

    return packagesByLicense;
}

function logResults(packagesByLicense) {
    let licenses = Object.keys(packagesByLicense);

    licenses.forEach(function(license) {
        console.log(colors.cyan(license));
        packagesByLicense[license].forEach(function(package) {
            console.log(package);
        });
        console.log();
    });

    console.log(colors.green('\nCOUNTS'));
    licenses.forEach(function(license) {
        console.log(
            `${license}: ${packagesByLicense[license].length}`
        );
    });
}