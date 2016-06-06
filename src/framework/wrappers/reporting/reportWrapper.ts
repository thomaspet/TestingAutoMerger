import {Injectable} from '@angular/core';

declare var Stimulsoft;

@Injectable()
export class StimulsoftReportWrapper {

    constructor() {
        
    }
            
    public showReport(template : string, reportData : string[], caller : any)
    {
        if (template && reportData && caller)
        {
            var report = this.generateReport(template, reportData);
            
            if (report) {
                // Create a text writer objects.
                var textWriter = new Stimulsoft.System.IO.TextWriter();
                var htmlTextWriter = new Stimulsoft.Report.Export.StiHtmlTextWriter(textWriter);

                // Export HTML using text writer.
                var settings = new Stimulsoft.Report.Export.StiHtmlExportSettings();
                var service = new Stimulsoft.Report.Export.StiHtmlExportService();

                service.exportTo(report, htmlTextWriter, settings);

                // Write HTML text to DIV element.
                caller.report = textWriter.getStringBuilder().toString();
            }
        }
    }

    public printReport(template: string, reportData: string[], showPreview: boolean) {
        
        if (template && reportData) {
            var report = this.generateReport(template, reportData);
            
            if (report) {
                var settings = new Stimulsoft.Report.Export.StiPdfExportSettings();
                // Create an PDF service instance.
                var service = new Stimulsoft.Report.Export.StiPdfExportService();

                // Create a MemoryStream object.
                var stream = new Stimulsoft.System.IO.MemoryStream();
                // Export PDF using MemoryStream.
                service.exportTo(report, stream, settings);

                // Get PDF data from MemoryStream object
                var data = stream.toArray();
                // Get report file name
                var fileName = (report.reportAlias === null || report.reportAlias.length == 0)  ? report.reportName : report.reportAlias;
                // Save data to file
                var obj: any = Object;
                
                obj.saveAs(data, fileName + '.pdf', 'application/pdf');
            }
        }
    }

    // these functions should be private in typescript
    private generateReport(template : string, reportData : string[]) : any {
        // load template
        var report = new Stimulsoft.Report.StiReport();
        report.load(template);

        // remove connections specified in the template file
        report.dictionary.databases.clear();

        // load report data
        var dataSet : any;

        for (var i = 0; i < reportData.length; ++i) {
            dataSet = new Stimulsoft.System.Data.DataSet('Data' + i);

            dataSet.readJson(reportData[i]);
            report.regData('Data' + i, 'Data' + i, dataSet);
        }
        // render
        report.render();
        return report;
    }
}
