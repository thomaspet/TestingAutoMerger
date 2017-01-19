import {Injectable} from '@angular/core';
import {fromByteArray} from 'base64-js';
declare var Stimulsoft;

@Injectable()
export class StimulsoftReportWrapper {

    constructor() {
        // Load stimulsoft
        const scriptTag: HTMLScriptElement = document.createElement('script');
        scriptTag.setAttribute('src', 'stimulsoft/Js/stimulsoft.reports.js')
        document.head.appendChild(scriptTag);
    }

    public showReport(template: string, reportData: Object, parameters: Array<any>, caller: any)
    {
        if (template && reportData && caller)
        {
            const report = this.generateReport(template, reportData, parameters);

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

    public printReport(template: string, reportData: Object, parameters: Array<any>, saveReport: boolean, format: string) {
        if (template && reportData) {
            Stimulsoft.Base.StiFontCollection.addOpentypeFontFile('assets/SourceSansPro-Regular.otf', 'Source Sans Pro');

            const report = this.generateReport(template, reportData, parameters);
            var mimetype: string;

            if (report) {
                var settings, service;

                switch (format) {
                    case 'html':
                        mimetype = 'text/html';
                        settings = new Stimulsoft.Report.Export.StiHtmlExportSettings();
                        service = new Stimulsoft.Report.Export.StiHtmlExportService();
                        settings.htmlType = Stimulsoft.Report.StiHtmlType.Html5;
                        break;
                    case 'doc':
                        mimetype = 'application/doc';
                        settings = new Stimulsoft.Report.Export.StiWord2007ExportSettings();
                        service = new Stimulsoft.Report.Export.StiWord2007ExportService();
                        break;
                    case 'xls':
                        mimetype = 'application/xls';
                        settings = new Stimulsoft.Report.Export.StiExcel2007ExportSettings();
                        service = new Stimulsoft.Report.Export.StiExcel2007ExportService();
                        break;
                    case 'jpg':
                        mimetype = 'image/jpeg';
                        settings = new Stimulsoft.Report.Export.StiJpegExportSettings();
                        service = new Stimulsoft.Report.Export.StiJpegExportService();
                        break;
                    case 'png':
                        mimetype = 'image/png';
                        settings = new Stimulsoft.Report.Export.StiPngExportSettings();
                        service = new Stimulsoft.Report.Export.StiPngExportService();
                        break;
                    default:
                        mimetype = 'application/pdf';
                        settings = new Stimulsoft.Report.Export.StiPdfExportSettings();
                        service = new Stimulsoft.Report.Export.StiPdfExportService();
                        break;
                }

                const fileName = (report.reportAlias === null || report.reportAlias.length === 0)  ? report.reportName : report.reportAlias;
                const obj: any = Object;
                var data: any;

                // Export
                if (format === 'html') {
                    const textWriter = new Stimulsoft.System.IO.TextWriter();
                    const htmlTextWriter = new Stimulsoft.Report.Export.StiHtmlTextWriter(textWriter);
                    service.exportTo(report, htmlTextWriter, settings);
                    data = textWriter.getStringBuilder().toString();
                } else {
                    const stream = new Stimulsoft.System.IO.MemoryStream();
                    service.exportTo(report, stream, settings);
                    data = stream.toArray();
                }

                // Save or return
                if (saveReport) {
                    obj.saveAs(data, fileName + '.' + format, mimetype);
                } else {
                    switch (format) {
                        case 'html':
                            return btoa(data);
                        default:
                            return fromByteArray(data);
                    }
                }
            }
        }
    }

    // these functions should be private in typescript
    private generateReport(template: string, reportData: Object, parameters: Array<any>): any {
        // load template
        const report = new Stimulsoft.Report.StiReport();
        report.load(template);

        // remove connections specified in the template file
        report.dictionary.databases.clear();

        // add variables based on parameters
        if (parameters) {
            for (let i = 0; i < parameters.length; i++) {
                let reportParam = report.dictionary.variables.getByName(parameters[i].Name);
                if (reportParam) {
                    reportParam.valueObject = parameters[i].value;
                }
            }
        }

        const dataSet = new Stimulsoft.System.Data.DataSet('Data');
        dataSet.readJson(reportData);
        report.regData('Data', 'Data', dataSet);

        // render
        report.render();
        return report;
    }
}
