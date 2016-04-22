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

// Loading fonts
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

// Creating export settings
var settings = new Stimulsoft.Report.Export.StiHtmlExportSettings();

// Creating export service
var service = new Stimulsoft.Report.Export.StiHtmlExportService();

// Creating text writer 
var textWriter = new Stimulsoft.System.IO.TextWriter();

// Creating HTML writer
var htmlTextWriter = new Stimulsoft.Report.Export.StiHtmlTextWriter(textWriter);

// Exportong report into HTML writer
service.exportTo(report, htmlTextWriter, settings);

// Set HTML-data to string
var resultHtml = textWriter.getStringBuilder().toString();

// Saving string with rendered report in HTML into a file
fs.writeFileSync('./SimpleList.html', resultHtml);
console.log("Rendered report saved into HTML-file.");