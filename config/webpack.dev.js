var webpack = require('webpack')
var helpers = require('./helpers');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');

module.exports = {
    entry: {
        // vendors: [
        //     '@angular/common',
        //     '@angular/compiler',
        //     '@angular/core',
        //     '@angular/forms',
        //     '@angular/http',
        //     '@angular/platform-browser',
        //     '@angular/platform-browser-dynamic',
        //     '@angular/router',
        //     'rxjs',

        //     'moment/min/moment.min.js',
        //     'file-saver/FileSaver.min.js',
        //     'base64-js/base64js.min.js',
        //     'accounting/accounting.min.js',
        //     'chart.js/dist/Chart.min.js',
        //     'immutable/dist/immutable.min.js',
        //     'lodash/lodash.min.js',
        //     'jwt-decode/build/jwt-decode.min.js',
        //     'jquery/dist/jquery.min.js',
        //     'uniform-ng2/main',
        //     'unitable-ng2/main'
        // ],
        // vendors: [
        //     // 'moment/min/moment.min.js',
        //     // 'file-saver/FileSaver.min.js',
        //     // 'base64-js/base64js.min.js',
        //     // 'accounting/accounting.min.js',
        //     // 'chart.js/dist/Chart.min.js',
        //     // 'immutable/dist/immutable.min.js',
        //     // 'lodash/lodash.min.js',
        //     // 'jwt-decode/build/jwt-decode.min.js',
        //     // 'jquery/dist/jquery.min.js',
        //     // 'uniform-ng2/main',
        //     // 'unitable-ng2/main'
        //     './src/vendor.ts'
        // ],
        app: [
            'core-js/client/shim',
            'reflect-metadata',
            'zone.js/dist/zone',

            './src/main.ts'
        ],

        // vendors: [
        //     // 'core-js/client/shim',
        //     // 'reflect-metadata',
        //     // 'zone.js/dist/zone',

        //     '@angular/common',
        //     '@angular/compiler',
        //     '@angular/core',
        //     '@angular/forms',
        //     '@angular/http',
        //     '@angular/platform-browser',
        //     '@angular/platform-browser-dynamic',
        //     '@angular/router',
        //     'rxjs',

        //     'moment/min/moment.min.js',
        //     'file-saver/FileSaver.min.js',
        //     'base64-js/base64js.min.js',
        //     'accounting/accounting.min.js',
        //     'chart.js/dist/Chart.min.js',
        //     'immutable/dist/immutable.min.js',
        //     'lodash/lodash.min.js',
        //     'jwt-decode/build/jwt-decode.min.js',
        //     'jquery/dist/jquery.min.js',
        //     'uniform-ng2/main',
        //     'unitable-ng2/main'
        // ]
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    output: {
        path: helpers.root('dist'),
        // publicPath: 'http://localhost:8080/',
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js',
        sourceMapFilename: '[file].map'
    },

    plugins: [
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: ['vendors']
        // }),
        new webpack.DllReferencePlugin({
            context: '.',
            manifest: require(helpers.root('dist') + '/vendors-manifest.json')
        }),
        // new webpack.DllReferencePlugin({
        //     context: '.',
        //     manifest: require(helpers.root('dist') + '/polyfills-manifest.json')
        // }),
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'vendors',
        //     chunks: ['app'],
        //     minChunks: Infinity
        // }),
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            helpers.root('./src'), // location of your src
            {} // a map of your routes
        ),

        // new HtmlWebpackPlugin({
        //     template: 'src/index.html'
        // }),

        // new webpack.optimize.CommonsChunkPlugin({
        //     name: ["app", "vendors"]
        // })
        // new webpack.optimize.UglifyJsPlugin({
        //     beautify: false,
        //     comments: false,
        //     compress: {
        //         warnings: false,
        //     }
        // })
    ],

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: [
                    'awesome-typescript-loader',
                    'angular2-template-loader',
                    'angular2-router-loader'
                ],
                exclude: [/\.(spec|e2e|d)\.ts$/]
            },
            {
                test: /\.sass$/,
                exclude: /node_modules/,
                loaders: ['raw-loader', 'sass-loader']
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
        ]
    },

    devtool: 'source-map'

    // devServer: {
    //     historyApiFallback: true,
    //     stats: 'minimal'
    // }
}
