import {Injectable} from '@angular/core';

declare var Stimulsoft;

@Injectable()
export class StimulsoftReportWrapper {

    constructor() {
        /**
         * load stimulsoft
         * 
         * Zone.js overwrites native promise 
         * and Stimulsoft also does
         * 
         * so we need to restore Zone.js promise 
         * to allow angular2 working properly
         */
        const backup = Promise;
        System.import('stimulsoft.reports.js').then(function() {
            Promise = backup;

            // add font
            Stimulsoft.Base.StiFontCollection.addOpentypeFontFile("assets/SourceSansPro-Regular.otf", "Source Sans Pro");
        });
    }
            
    public showReport(template: string, reportData: Object, caller : any)
    {
        if (template && reportData && caller)
        {
            const report = this.generateReport(template, reportData);
            
            if (report) {            
                // Create a text writer objects.
                const textWriter = new Stimulsoft.System.IO.TextWriter();
                const htmlTextWriter = new Stimulsoft.Report.Export.StiHtmlTextWriter(textWriter);

                // Export HTML using text writer.
                const settings = new Stimulsoft.Report.Export.StiHtmlExportSettings();
                const service = new Stimulsoft.Report.Export.StiHtmlExportService();           
                settings.htmlType = Stimulsoft.Report.StiHtmlType.Html5;

                service.exportTo(report, htmlTextWriter, settings);

                // Write HTML text to DIV element.
                caller.report = textWriter.getStringBuilder().toString();
            }
        }
    }

    public printReport(template: string, reportData: Object, showPreview: boolean) {
        
        if (template && reportData) {
            const report = this.generateReport(template, reportData);
            
            if (report) {
                const settings = new Stimulsoft.Report.Export.StiPdfExportSettings();
                // Create an PDF service instance.
                const service = new Stimulsoft.Report.Export.StiPdfExportService();

                // Create a MemoryStream object.
                const stream = new Stimulsoft.System.IO.MemoryStream();
                // Export PDF using MemoryStream.
                service.exportTo(report, stream, settings);

                // Get PDF data from MemoryStream object
                const data = stream.toArray();
                // Get report file name
                const fileName = (report.reportAlias === null || report.reportAlias.length == 0)  ? report.reportName : report.reportAlias;
                // Save data to file
                const obj: any = Object;
                
                obj.saveAs(data, fileName + '.pdf', 'application/pdf');
            }
        }
    }

    // these functions should be private in typescript
    private generateReport(template: string, reportData: Object) : any {
        // load template
        const report = new Stimulsoft.Report.StiReport();
        report.load(template);

        // remove connections specified in the template file
        report.dictionary.databases.clear();
        
        const dataSet = new Stimulsoft.System.Data.DataSet('Data');    
        dataSet.readJson(reportData);
        report.regData('Data', 'Data', dataSet);
              
        // render
        report.render();
        return report;
    }
}
