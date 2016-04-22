// File System module
var fs = require('fs');

// Remove BOM mark module
var stripBom = require('strip-bom');

// Opentype Fonts
var opentype = require('opentype.js');

// Stimulsoft Reports module
var Stimulsoft = require('./stimulsoft.reports').Stimulsoft;
console.log("Stimulsoft Reports loaded");

//Initialize NodeJs Functions
Stimulsoft.System.NodeJs.initialize();

var font = opentype.loadSync('Roboto-Black.ttf');
Stimulsoft.Base.StiFontCollection.addOpentypeFont(font);
console.log("Font loaded");

// Creating new report
var report = new Stimulsoft.Report.StiReport();
console.log("New report created");

// Loading report template
var reportTemplate = fs.readFileSync('./SimpleList.mrt', "utf8");
report.load(reportTemplate);
console.log("Report template loaded");

// Loading demo data
var demoData = stripBom(fs.readFileSync('./Demo.json', "utf8"));
report.dictionary.databases.clear();
report.regData("Demo", "Demo", demoData);
console.log("Demo data loaded into the report. Tables count: ", report.dataStore.count);

// Renreding report
report.render();
console.log("Report rendered. Pages count: ", report.renderedPages.count);

// Saving rendered report to file
var renderedReport = report.saveDocumentToJsonString();
fs.writeFileSync('./SimpleList.mdc', renderedReport);
