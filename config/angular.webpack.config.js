var webpack = require('webpack');


module.exports = {
    entry: {
        'angular': [
            '@angular/common/bundles/common.umd.min.js',
            '@angular/compiler/bundles/compiler.umd.min.js',
            '@angular/core/bundles/core.umd.min.js',
            '@angular/forms/bundles/forms.umd.min.js',
            '@angular/http/bundles/http.umd.min.js',
            '@angular/platform-browser/bundles/platform-browser.umd.min.js',
            '@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.min.js',
            '@angular/router/bundles/router.umd.min.js',
            // '@angular/common',
            // '@angular/compiler',
            // '@angular/core',
            // '@angular/forms',
            // '@angular/http',
            // '@angular/platform-browser',
            // '@angular/platform-browser-dynamic',
            // '@angular/router',

        ]
    },

    output: {
        filename: '[name].bundle.js',
        path: 'dist/',
        library: '[name]_lib',
    },

    module: {
        loaders: [
            // fix angular2
            {
                test: /(systemjs_component_resolver|system_js_ng_module_factory_loader)\.js$/,
                loader: 'string-replace-loader',
                query: {
                    search: '(lang_1(.*[\\n\\r]\\s*\\.|\\.))?' +
                    '(global(.*[\\n\\r]\\s*\\.|\\.))?' +
                    '(System|SystemJS)(.*[\\n\\r]\\s*\\.|\\.)import\\((.+)\\g)',
                    replace: '$5.import($7)',
                    // flags: 'g'
                },
                include: ['node_modules/@angular/core']
            },
            {
                test: /\.js$/,
                loader: 'string-replace-loader',
                query: {
                    search: 'moduleId: module.id,',
                    replace: '',
                    // flags: 'g'
                }
            },
            // end angular2 fix
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            }
        ]
    },

    plugins: [
        new webpack.DllPlugin({
            // The path to the manifest file which maps between
            // modules included in a bundle and the internal IDs
            // within that bundle
            path: 'dist/[name]-manifest.json',
            // The name of the global variable which the library's
            // require function has been assigned to. This must match the
            // output.library option above
            name: '[name]_lib'
        }),

        // Fix Angular 2
        new NormalModuleReplacementPlugin(
            /facade(\\|\/)async/,
            helpers.root('node_modules/@angular/core/src/facade/async.js')
        ),
        new NormalModuleReplacementPlugin(
            /facade(\\|\/)collection/,
            helpers.root('node_modules/@angular/core/src/facade/collection.js')
        ),
        new NormalModuleReplacementPlugin(
            /facade(\\|\/)errors/,
            helpers.root('node_modules/@angular/core/src/facade/errors.js')
        ),
        new NormalModuleReplacementPlugin(
            /facade(\\|\/)lang/,
            helpers.root('node_modules/@angular/core/src/facade/lang.js')
        ),
        new NormalModuleReplacementPlugin(
            /facade(\\|\/)math/,
            helpers.root('node_modules/@angular/core/src/facade/math.js')
        ),

        // new webpack.optimize.UglifyJsPlugin({
        //     beautify: false,
        //     comments: false,
        //     compress: {
        //         warnings: false,
        //     }
        // })
    ]
}