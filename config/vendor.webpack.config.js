var webpack = require('webpack');
var helpers = require('./helpers');
// var NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');

module.exports = {
    entry: {
        vendors: [
            'core-js/client/shim',
            'reflect-metadata',
            // 'zone.js/dist/zone',

            '@angular/common',
            '@angular/compiler',
            '@angular/core',
            '@angular/forms',
            '@angular/http',
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            '@angular/router',

            'moment/min/moment.min.js',
            'file-saver/FileSaver.min.js',
            'base64-js/base64js.min.js',
            'accounting/accounting.min.js',
            'chart.js/dist/Chart.min.js',
            'immutable/dist/immutable.min.js',
            'lodash/lodash.min.js',
            'jwt-decode/build/jwt-decode.min.js',
            'jquery/dist/jquery.min.js',
            'uniform-ng2/main',
            'unitable-ng2/main'
        ]
    },

    output: {
        filename: '[name].standalone.js',
        path: 'dist/',
        library: '[name]_lib',
    },

    // module: {
    //     // REVISIT: not needed?
    //     loaders: [
    //         {
    //             test: /\.ts$/,
    //             loaders: ['awesome-typescript-loader', 'angular2-template-loader']
    //         }
    //     ]
    // },

    plugins: [
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            helpers.root('./src'), // location of your src
            {} // a map of your routes
        ),
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: ['angular']
        // }),
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


        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
            compress: {
                warnings: false,
            }
        })
    ]
}