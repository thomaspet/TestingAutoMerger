const webpack = require('webpack')
const helpers = require('./helpers');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WatchLiveReloadPlugin = require('webpack-watch-livereload-plugin');

module.exports = {
    devtool: 'source-map',
    cache: true,
    watch: true,
    stats: 'minimal',

    entry: {
        app: [
            'core-js/client/shim.min',
            'reflect-metadata',
            'zone.js/dist/zone.min',

            // './src/rxjs.imports.ts',
            './src/main.ts',
        ]
    },

    resolve: {
        extensions: ['.ts', '.js'],
    },

    output: {
        path: helpers.root('dist'),
        pathinfo: true,
        // publicPath: 'http://localhost:8080/',
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
                // include: [/src/],
                // exclude: [/\.(spec|e2e|d|node_modules)\.ts$/]
            },

            {
                test: /\.html$/,
                // include: [/src/],
                exclude: /node_modules/,
                loader: 'html-loader'
            },

            {
                test: /\.(jpg|png)$/,
                // include: [/src/],
                exclude: /node_modules/,
                use: 'file-loader'
            },
        ]
    },

    devServer: {
        contentBase: 'dist/',
        historyApiFallback: true,
        stats: 'minimal',
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    }
}
