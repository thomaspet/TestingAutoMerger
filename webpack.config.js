// Use this file for extending the default Angular CLI webpack config
// The @angular-builders/custom-webpack dev dependency allows us to do this
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = (config, options, targetOptions) => {
    const sourcemaps = targetOptions.target === 'serve' ? 'eval' : undefined;
    config.devtool = sourcemaps;
    config.resolve.alias['chart.js'] = 'chart.js/dist/Chart.min.js';
    config.plugins.push(
        new MomentLocalesPlugin({
            localesToKeep: ['nb'],
        })
    );

    return config;
};

// module.exports = {
//     plugins: [
//         new MomentLocalesPlugin({
//             localesToKeep: ['nb'],
//         }),
//     ],
//     resolve: {
//         alias: {
//             // Avoid using the bundled chartjs version with moment
//             'chart.js': 'chart.js/dist/Chart.min.js'
//         }
//     }
// }