const webpack = require('webpack')
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./common.webpack.js');
const DefinePlugin = require('webpack/lib/DefinePlugin');

module.exports = function(options) {
    if (!options || !options.apiServer) {
        throw new Error('--env.apiServer is required argument for UniMicro webpack-dev-server command')
    }
    return webpackMerge(commonConfig, {
        devServer: {
            contentBase: 'dist/',
            historyApiFallback: true,
            stats: 'minimal',
            proxy: {
                "/api": {
                    target: options.apiServer,
                    secure: false,
                    changeOrigin: true
                }
            },
            watchOptions: {
                aggregateTimeout: 300,
                poll: 1000
            }
        },
        plugins: [
            new DefinePlugin({
                'ENV': JSON.stringify('production'),
                'process.env': {
                    'ENV': JSON.stringify('production'),
                }
            }),

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
        ]
    });
}
