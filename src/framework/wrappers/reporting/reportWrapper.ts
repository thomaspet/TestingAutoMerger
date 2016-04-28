import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';

declare var Stimulsoft;

@Injectable()
export class StimulsoftReportWrapper {
    private caller : any;
    constructor(private http : Http) {
        
    }
    
    public start(caller: any)
    {
        this.caller = caller;
        this.http.get('/assets/DemoData/Demo.json') 
            .map(res => res.text())
            .subscribe(data => this.onReportDataLoaded( [data] ),
                    err => this.onError("Cannot load test data from json file."));
    }

    private onReportDataLoaded(reportData : string[])
    {
        this.showReport("Demo", reportData, "reportContainer")
        //this.printReport("Demo", reportData, true);
    }
    // report interface
    public getReportTypes()
    {
        // hard coded for test purpose
        // @TODO: implement and use API resource
        var reportTypes = ["Demo"];

        return reportTypes
    }

    public showReport(reportType : string, reportData : string[], targetDivId : string)
    {
        if (reportType && targetDivId && reportData)
        {
            this.generateReport(reportType, reportData, (report) => {
                var container = document.getElementById(targetDivId);

                if (container) {
                    // Create a text writer objects.
                    var textWriter = new Stimulsoft.System.IO.TextWriter();
                    var htmlTextWriter = new Stimulsoft.Report.Export.StiHtmlTextWriter(textWriter);

                    // Export HTML using text writer.
                    var settings = new Stimulsoft.Report.Export.StiHtmlExportSettings();
                    var service = new Stimulsoft.Report.Export.StiHtmlExportService();

                    service.exportTo(report, htmlTextWriter, settings);

                    // Write HTML text to DIV element.
                    //container.innerHTML = textWriter.getStringBuilder().toString();
                    this.caller.report = textWriter.getStringBuilder().toString();
                }
            });
        }
    }

    public printReport(reportType : string, reportData : string[], showPreview : boolean)
    {
        if (reportType, reportData)
        {
            this.generateReport(reportType, reportData, (report) => {
                if (report) {
                    report.print();
                }
            });
        }
    }

    // these functions should be private in typescript
    private generateReport(reportType : string, reportData : string[], callback : any)
    {
        this.getReportTemplate(reportType, function (template) {
            // load template
            var report = new Stimulsoft.Report.StiReport();
            report.load(template);

            // remove connections specified in the template file
            report.dictionary.databases.clear();

            // load report data
            var dataSet : any;

            for (var i = 0; i < reportData.length; ++i) {
                dataSet = new Stimulsoft.System.Data.DataSet("Data" + i);

                dataSet.readJson(reportData[i]);
                report.regData("Data" + i, "Data" + i, dataSet);
            }
            // render
            report.render();
            callback(report);
        });
    }

    private getReportTemplate(reportType, onDone)
    {
        // for test purpose only
        // @TODO: implement and use API resource
        
        this.http.get('/assets/DemoData/Demo.mrt') 
            .map(res => res.text())
            .subscribe(data => onDone(data),
            err => this.onError("Cannot load report template."));
    }
    
    private onError(err : string)
    {
        alert(err)
    }
}
