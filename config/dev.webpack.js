const webpack = require('webpack')
const webpackMerge = require('webpack-merge');
const commonConfig = require('./common.webpack.js');
const DefinePlugin = require('webpack/lib/DefinePlugin');

module.exports = function(options) {
    var config = webpackMerge(commonConfig, {
        devServer: {
            contentBase: 'dist/',
            historyApiFallback: true,
            stats: 'minimal',
            watchOptions: {
                aggregateTimeout: 300,
                poll: 1000
            }
        },
        plugins: [
            new DefinePlugin({
                'ENV': JSON.stringify('develop'),
                'process.env': {
                    'ENV': JSON.stringify('develop'),
                }
            })
        ]
    });

    if (options && options.typecheck) {
        config.module.loaders[0] = {
            test: /\.ts$/,
            loaders: [
                'awesome-typescript-loader?transpileOnly=false',
                'angular2-template-loader',
                'angular-router-loader'
            ],
            exclude: [/\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/]
        };
    }

    return config;
}
