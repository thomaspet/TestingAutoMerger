const webpack = require('webpack')
const helpers = require('./helpers');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WatchLiveReloadPlugin = require('webpack-watch-livereload-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const OptimizeJsPlugin = require('optimize-js-plugin');

module.exports = {
    devtool: 'cheap-source-map',
    cache: true,

    entry: {
        app: [
            'core-js/client/shim.min',
            'reflect-metadata',
            'zone.js/dist/zone.min',

            './src/rxjs.imports.ts',
            './src/main.ts',
        ]
    },

    resolve: {
        extensions: ['.ts', '.js'],
    },

    output: {
        path: helpers.root('dist'),
        pathinfo: true,
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js',
        sourceMapFilename: '[file].map'
    },

    plugins: [
        new webpack.DllReferencePlugin({
            context: '.',
            manifest: require(helpers.root('dist') + '/vendors-manifest.json')
        }),

        new CopyWebpackPlugin([
            {from: 'src/index.html'},
            {from: 'src/styles/main.css'},
            {from: 'src/assets', to: 'assets/'}
        ]),

        new OptimizeJsPlugin({
            sourceMap: false
        }),

        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            output: {
                comments: false
            },

            mangle: {
                screw_ie8: true
            },

            compress: {
                screw_ie8: true,
                warnings: false,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true,
                negate_iife: false // we need this for lazy v8
            }
        })
    ],

    module: {

        loaders: [
            {
                test: /\.ts$/,
                loaders: [
                    'awesome-typescript-loader',
                    'angular2-template-loader',
                    'angular-router-loader'
                ],
                exclude: [/\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/]
            },

            {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: 'html-loader'
            },

            {
                test: /\.(jpg|png)$/,
                exclude: /node_modules/,
                use: 'file-loader'
            },
        ]
    },
}
