// Use this file for extending the default Angular CLI webpack config
// The @angular-builders/custom-webpack dev dependency allows us to do this
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
    plugins: [
        new MomentLocalesPlugin({
            localesToKeep: ['es-us', 'nb'],
        }),
    ],
    resolve: {
        alias: {
            // Avoid using the bundled chartjs version with moment
            'chart.js': 'chart.js/dist/Chart.min.js'
        }
    }
};