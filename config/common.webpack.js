const webpack = require('webpack')
const helpers = require('./helpers');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const UniIndexPlugin = require('./uniIndexPlugin');

module.exports = {
    devtool: 'source-map',
    stats: 'minimal',

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
            {from: 'src/styles/main.css'},
            {from: 'src/assets', to: 'assets/'},
        ]),

        new AddAssetHtmlPlugin([{
            filepath: 'dist/vendors.bundle.js',
            hash: true,
        }]),

        new HtmlWebpackPlugin({
            template: 'src/index.html',
            hash: true
        }),

        new UniIndexPlugin(),
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

