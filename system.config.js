/* System.config({
	defaultJSExtensions: true,
	paths: {
		'rxjs/*' : './lib/rxjs/*.js'
	},
	packages: {
		"app": {"defaultExtension": "js"},
		"framework": {"defaultExtension": "js"},
		"rxjs": {defaultExtension: "js"}
	}
}); */


/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
/** Map relative paths to URLs. */
var map = {};
/** User packages configuration. */
var packages = {};
////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
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
	// Thirdparty barrels.
	'rxjs',
	// App specific barrels.
	//'app',
	//'app/shared',
];
var cliSystemConfigPackages = {};
barrels.forEach(function (barrelName) {
	cliSystemConfigPackages[barrelName] = { main: 'index' };
});
cliSystemConfigPackages["app"] = {"defaultExtension": "js"};
cliSystemConfigPackages["framework"] = {"defaultExtension": "js"};
cliSystemConfigPackages["rxjs"] = {"defaultExtension": "js"};

// Apply the CLI SystemJS configuration.
System.config({
	map: {
		'@angular': 'angular2',
		'rxjs': 'angular2/rxjs',
		//'main': 'app/bootstrap.js'
	},
	packages: cliSystemConfigPackages
});
// Apply the user's configuration.
System.config({ map: map, packages: packages });
