import {Component} from "angular2/core";
import {Http, Headers} from 'angular2/http';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from "angular2/router";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {ComponentProxy} from "../../../../framework/core/componentProxy";

const OVERVIEW_ROUTES = [];

declare var Stimulsoft;

@Component({
    selector: "uni-overview",
    templateUrl: "app/components/reports/overview/overview.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(OVERVIEW_ROUTES)
export class Overview {
    public title : string = "Proof Of Concept";
    
    childRoutes: RouteDefinition[];
    public reportWrapper: StimulsoftReportWrapper;
    
    
    constructor(public router: Router, private tabService: TabService, private http: Http) {
        this.tabService.addTab({name: "Rapportoversikt", url: "/reports/overview"});
        this.childRoutes = OVERVIEW_ROUTES.slice(0, OVERVIEW_ROUTES.length - 1);
        this.reportWrapper = new StimulsoftReportWrapper(http);
        this.reportWrapper.start()
    }
}

class StimulsoftReportWrapper {
    public reportContent : string
    constructor(private http : Http) {
        
    }
    
    public start()
    {
        this.http.get('/assets/DemoData/Demo.json') 
            .map(res => res.text())
            .subscribe(data => this.onReportDataLoaded( [data] ),
                    err => this.onError("Cannot load test data from json file."));
    }

    public onReportDataLoaded(reportData : string[])
    {
        this.showReport("Demo", reportData, "DivReport")
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
                    this.reportContent = textWriter.getStringBuilder().toString();
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
    public generateReport(reportType : string, reportData : string[], callback : any)
    {
        this.getReportTemplate(reportType, function (template) {
            // load template
            var report = new Stimulsoft.Report.StiReport();
            report.load(template);

            // remove connections specified in the template file
            report.dictionary.databases.clear();

            // load report data
            var dataSet : Stimulsoft.System.Data.Dataset;

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

    public getReportTemplate(reportType, onDone)
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
