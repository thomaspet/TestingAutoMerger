System.config({
	defaultJSExtensions: true,
	paths: {
		'rxjs/observable/*' : './lib/rxjs/add/observable/*.js',
		'rxjs/operator/*' : './lib/rxjs/add/operator/*.js',
		'rxjs/*' : './lib/rxjs/*.js'
	},
	packages: {
		"app": {"defaultExtension": "js"},
		"framework": {"defaultExtension": "js"},
		"rxjs": {defaultExtension: "js"}
	}
});
