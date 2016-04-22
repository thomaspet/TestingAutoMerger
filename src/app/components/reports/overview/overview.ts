import {Component} from "angular2/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from "angular2/router";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {ComponentProxy} from "../../../../framework/core/componentProxy";

//import * as Stimulsoft from "stimulsoft.reports.js";

const OVERVIEW_ROUTES = [];

@Component({
    selector: "uni-overview",
    templateUrl: "app/components/reports/overview/overview.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(OVERVIEW_ROUTES)
export class Overview {
    public title : string = "Proof Of Concept";

    childRoutes: RouteDefinition[];
    reportWrapper: StimulsoftReportWrapper;

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({name: "Rapportoversikt", url: "/reports/overview"});
        this.childRoutes = OVERVIEW_ROUTES.slice(0, OVERVIEW_ROUTES.length - 1);
        this.reportWrapper = new StimulsoftReportWrapper();
        //this.reportWrapper.start()
    }
}

class StimulsoftReportWrapper {
/*    public start()
    {
        $.ajax({
            type: 'GET',
            url: '/DemoData/DemoInvoice.json',
            success: function (reportData) {
                this.onReportDataLoaded([ reportData ]);
            }
        });
    }

    public onReportDataLoaded(reportData)
    {
        this.showReport("Demo", reportData, "DivReport")
    }
    // report interface
    public getReportTypes()
    {
        // hard coded for test purpose
        // @TODO: implement and use API resource
        var reportTypes = ["Demo"];

        return reportTypes
    }

    public showReport(reportType, reportData, targetDivId)
    {
        if (reportType && targetDivId && reportData)
        {
            this.generateReport(reportType, reportData, function (report) {
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
                    container.innerHTML = textWriter.getStringBuilder().toString();
                }
            });
        }
    }

    public printReport(reportType, reportData, showPreview)
    {
        if (reportType, reportData)
        {
            this.GenerateReport(reportType, reportData, function (report) {
                if (report) {
                    report.print();
                }
            });
        }
    }

    // these functions should be private in typescript
    public generateReport(reportType, reportData, callback)
    {
        this.getReportTemplate(reportType, function (template) {
            // load template
            report = new Stimulsoft.Report.StiReport()
            report.load(template);

            // remove connections specified in the template file
            report.dictionary.databases.clear();

            // load report data
            var dataSet;

            for (i = 0; i < reportData.length; ++i) {
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
        $.ajax({
            type: 'GET',
            url: "/DemoData/" + reportType + ".mrt",
            success: function (template)
            {
                onDone(template);
            }
        });
    }*/
}
