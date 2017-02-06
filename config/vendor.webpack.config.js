var webpack = require('webpack');
var helpers = require('./helpers');

module.exports = {
    entry: {
        vendors: [
            '@angular/common',
            '@angular/compiler',
            '@angular/core',
            '@angular/forms',
            '@angular/http',
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            '@angular/router',

            'moment/locale/nb.js',
            'moment/locale/en-gb.js',
            'file-saver/FileSaver.min.js',
            'base64-js/base64js.min.js',
            'accounting/accounting.min.js',
            'immutable/dist/immutable.min.js',
            'jwt-decode/build/jwt-decode.min.js',

            'jquery/dist/jquery.min.js',
            'lodash/lodash.min.js',

            'uniform-ng2/main',
            'unitable-ng2/main',
            'unisearch-ng2',
        ]
    },

    output: {
        filename: '[name].bundle.js',
        path: 'dist/',
        library: '[name]_lib',
        sourceMapFilename: '[file].map'
    },

    plugins: [
        // Only load english and norwegian locales with moment
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|no|)$/),

        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            helpers.root('./src'), // location of your src
            {} // a map of your routes
        ),
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

        new webpack.ProvidePlugin({
            $: 'jquery/dist/jquery.min.js',
            jQuery: 'jquery/dist/jquery.min.js',
            _: 'lodash/lodash.min.js',
            lodash: 'lodash/lodash.min.js',
            // moment: 'moment/min/moment.min.js'
        })


        // new webpack.optimize.UglifyJsPlugin({
        //     beautify: false,
        //     comments: false,
        //     compress: {
        //         warnings: false,
        //     }
        // })
    ],

    devtool: 'source-map'
}