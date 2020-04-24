// const path = require('path');
// const colors = require('colors/safe');
// const fs = require('fs');

// const project_root = path.resolve(__dirname, '..');
// const localePath = path.join(project_root, 'node_modules/moment/locale');

// fs.readdir(localePath, (err, filenames) => {
//     if (err) {
//         console.log(colors.red('!! Unable to remove moment locales'))
//         console.log(colors.yellow('> This probably wont mess up the build, but someone should look into it (scripts/post-install.js)'));
//     } else {
//         let deleteFailed;
//         filenames.forEach(filename => {
//             if (filename !== 'nb.js') {
//                 try {
//                     fs.unlinkSync(`${localePath}/${filename}`);
//                 } catch (e) {
//                     deleteFailed = true;
//                 }
//             }
//         });

//         if (deleteFailed) {
//             console.log(colors.red('!! Error when removing moment locales'))
//             console.log(colors.yellow('> This probably wont mess up the build, but someone should look into it (scripts/post-install.js)'));
//         }
//     }
// });
