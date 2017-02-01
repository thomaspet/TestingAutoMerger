var webpack = require('webpack')
var NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
var helpers = require('./helpers');
// var ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
    entry: {
        app: './src/main.ts' //helpers.root('src/main.ts'),
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    output: {
        filename: '[name].bundle.js',
        path: 'dist/',
        // library: '[name]_lib',
    },

    plugins: [
        // new webpack.DllReferencePlugin({
        //     context: '.',
        //     manifest: require(helpers.root('dist') + '/angular-manifest.json')
        // }),
        // new webpack.DllReferencePlugin({
        //     context: '.',
        //     manifest: require(helpers.root('dist') + '/polyfills-manifest.json')
        // }),
        new webpack.DllReferencePlugin({
            context: '.',
            manifest: require(helpers.root('dist') + '/vendors-manifest.json')
        }),

        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            helpers.root('./src'), // location of your src
            {} // a map of your routes
        ),

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
    ],

    module: {
        loaders: [
            // fix angular2
            {
                test: /(systemjs_component_resolver|system_js_ng_module_factory_loader)\.js$/,
                loader: 'string-replace-loader',
                query: {
                    search: '(lang_1(.*[\\n\\r]\\s*\\.|\\.))?' +
                    '(global(.*[\\n\\r]\\s*\\.|\\.))?' +
                    '(System|SystemJS)(.*[\\n\\r]\\s*\\.|\\.)import\\((.+)\\)',
                    replace: '$5.import($7)',
                    flags: 'g'
                },
                include: ['node_modules/@angular/core']
            },
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                loader: 'html'
            }
        ]
    },
}
