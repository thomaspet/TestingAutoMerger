const webpack = require('webpack')
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./common.webpack.js');
const DefinePlugin = require('webpack/lib/DefinePlugin');

module.exports = function(options) {
    return webpackMerge(commonConfig, {
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
