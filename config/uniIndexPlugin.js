'use strict';
const fs = require('fs');
function UniIndexPlugin(options) {}

UniIndexPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {

    let indexHtml = compilation.assets['index.html']
    if (indexHtml) {
        // Setup raygun stuff
        indexHtml = indexHtml.source().toString().replace('<raygunApiKeyCode>', getRaygunCode());

        // Add git revision
        indexHtml = indexHtml.replace('<uniVersions></uniVersions>', `
            <script type='text/javascript'>
                var APP_VERSION = '${getGitRevision()}';
                var APP_BUILD_DATE = '${(new Date()).toISOString()}';
            </script>
        `);

        indexHtml = indexHtml.replace('<%= appVersion %>', getGitRevision());

        compilation.assets['index.html'] = {
            source: function() {
                return indexHtml;
            },
            size: function() {
                return indexHtml.length;
            }
        }
    }

    callback();
  });
};

module.exports = UniIndexPlugin;

function getRaygunCode(){
    if (process.env.RAYGUN_API_KEY) {
        return '<script type="text/javascript">'
            + 'rg4js("apiKey", "' + process.env.RAYGUN_API_KEY + '");'
            + 'rg4js("enableCrashReporting", true);'
            + 'rg4js("setVersion", "' + getGitRevision() + '");'
            + '</script>';
    } else {
        return '';
    }
}

function getGitRevision() {
    const GIT_HEAD_FILE = '.git/HEAD';
    try {
        const head = fs.readFileSync(GIT_HEAD_FILE).toString().trim();

        // In prod, .git/HEAD will contain the revision, not a file path
        if (head.indexOf('/') >= 0) {
            const headPath = head.split(' ')[1];
            const commit = fs.readFileSync('.git/' + headPath).toString().trim();
            return commit;
        } else {
            return head;
        }

    } catch (e) {
        console.log('WARNING: Something went wrong when checking git revision in gulp task index.html');
        console.log(e);
        return null;
    }
}
