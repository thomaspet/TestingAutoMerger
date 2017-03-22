const webpack = require('webpack')
const webpackMerge = require('webpack-merge');
const commonConfig = require('./common.webpack.js');
const DefinePlugin = require('webpack/lib/DefinePlugin');

module.exports = function(options) {
    return webpackMerge(commonConfig, {
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
}
