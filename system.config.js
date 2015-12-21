System.config({
	defaultJSExtensions: true,
	paths: {
		'rxjs/*' : './lib/rxjs/*.js'
	},
	packages: {
		"app": {"defaultExtension": "js"},
		"framework": {"defaultExtension": "js"},
		"rxjs": {defaultExtension: "js"}
	}
});
