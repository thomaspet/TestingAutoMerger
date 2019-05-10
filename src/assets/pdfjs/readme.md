To avoid having to load pdfjs from CDN we're including the two files it  requires here.

This means we won't automatically get updates made by the mozilla team, so every now
and then we should update the files manually.

CDN file location:
https://mozilla.github.io/pdf.js/build/pdf.js
http://mozilla.github.io/pdf.js/build/pdf.worker.js

Note that the files are not minified on the CND. Please run them through an online minifier e.g https://jscompress.com/ before pasting here.

Also note that if you move or rename the files you'll need to update fileviewer.html to reflect the changes!