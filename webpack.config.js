// Use this file for extending the default Angular CLI webpack config
// The @angular-builders/custom-webpack dev dependency allows us to do this
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const webpack = require('webpack');

module.exports = (config, options, targetOptions) => {
    if (targetOptions.target === 'serve') {
        config.plugins.push(
            new webpack.SourceMapDevToolPlugin({
                exclude: /node_modules/
            })
        );
    }

    config.resolve.alias['chart.js'] = 'chart.js/dist/Chart.min.js';
    config.plugins.push(
        new MomentLocalesPlugin({
            localesToKeep: ['nb'],
        })
    );

    return config;
};
