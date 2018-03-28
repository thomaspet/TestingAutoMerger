import {Injectable} from '@angular/core';
import {fromByteArray} from 'base64-js';
import {environment} from 'src/environments/environment';
import {saveAs} from 'file-saver';
import {APP_METADATA} from 'src/environments/metadata';
import { ErrorService } from '@app/services/common/errorService';
declare var Stimulsoft;

@Injectable()
export class StimulsoftReportWrapper {
    private stimulsoftScriptsLoaded: {[key: string]: boolean} = {};
    private stimulsoftCSSLoaded: boolean = false;
    private viewer;
    constructor(private errorService: ErrorService) {}

    private loadStimulsoftCss() {
        if (this.stimulsoftCSSLoaded) {
            return;
        }
        const fileref = document.createElement('link');
        fileref.setAttribute('rel', 'stylesheet');
        fileref.setAttribute('type', 'text/css');
        fileref.setAttribute('href', 'assets/stimulsoft/stimulsoft.viewer.office2003.css');
        document.getElementsByTagName('head')[0].appendChild(fileref);
        this.stimulsoftCSSLoaded = true;
    }

    private loadStimulsoftScript(scriptName: string) {
        if (this.stimulsoftScriptsLoaded[scriptName]) {
            return Promise.resolve(true);
        } else {
            return new Promise(resolve => {
                const script: any = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'assets/stimulsoft/stimulsoft.' + scriptName + '.js?v=' + APP_METADATA.APP_VERSION;

                if (script.readyState) { // IE
                    script.onreadystatechange = () => {
                        if (script.readyState === 'loaded' || script.readyState === 'complete') {
                            script.onreadystatechange = null;
                            this.stimulsoftScriptsLoaded[scriptName] = true;
                            resolve();
                        }
                    };
                } else { // Reasonable browsers
                    script.onload = () => {
                        this.stimulsoftScriptsLoaded[scriptName] = true;
                        resolve();
                    };
                }

                script.onerror = error => this.errorService.handle(error);
                document.getElementsByTagName('head')[0].appendChild(script);
            });
        }
    }

    public loadLibraries() {

        return this.loadStimulsoft()
            .then(() => this.loadStimulsoftCss())
            .then(() => this.loadStimulsoftViewer())
            .then(() => Stimulsoft.Base.StiLicense.key = environment.STIMULSOFT_LICENSE)
            .then(() => Stimulsoft.Base.Localization.StiLocalization.setLocalizationFile('assets/stimulsoft/nb-NO.xml'));
    }

    private loadStimulsoft(): Promise<any> {
        return this.loadStimulsoftScript('reports');
    }

    private loadStimulsoftViewer(): Promise<any> {
        return this.loadStimulsoftScript('viewer');
    }

    public renderReport(template, data, parameters, localization, resolver) {
        const report = new Stimulsoft.Report.StiReport();
        report.load(template);

        // remove connections specified in the template file
        report.dictionary.databases.clear();
        // add variables based on parameters
        if (parameters) {
            for (let i = 0; i < parameters.length; i++) {
                let reportParam = report.dictionary.variables.getByName(parameters[i].Name);
                if (reportParam) {
                    reportParam.value = parameters[i].value;
                }
            }
        }

        const dataset = new Stimulsoft.System.Data.DataSet('Data');
        dataset.readJson(data);
        report.regData('Data', 'Data', dataset);
        if (localization) { report.localizeReport(localization); }
        report.render();
        resolver(report);
    }

    public renderHtml(report, resolver) {
        let runPromise = false;
        const options = new Stimulsoft.Viewer.StiViewerOptions();
        options.toolbar.visible = true;
        if (!this.viewer) {
            this.viewer = new Stimulsoft.Viewer.StiViewer(options, 'StiViewer', false);
        }
        this.viewer.onShowReport = () => {
            if (resolver && !runPromise) {
                resolver(true);
                runPromise = true;
            }
        };
        this.viewer.report = report;
        this.viewer.showProcessIndicator();
        this.viewer.renderHtml('reportContainer');

    }

    public showReport(template: string, reportData: Object, parameters: Array<any>, localization: string, caller: any) {
        if (!template || !reportData || !caller) {
            return;
        }
        this.loadStimulsoft().then(() => this.loadStimulsoftViewer().then(() => {
            Stimulsoft.Base.StiLicense.key = environment.STIMULSOFT_LICENSE; // Needed for newer versions
            this.renderReport(template, reportData, parameters, localization, (report) => {
                this.renderHtml(report, null);
            });
        }));
    }

    public printReport(template: string, reportData: Object, parameters: Array<any>, saveReport: boolean, format: string, localization: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!template || !reportData) {
                reject();
            } else {
                return this.loadStimulsoft().then(() => {
                    // Stimulsoft.Base.StiLicense.key = environment.STIMULSOFT_LICENSE; // Needed for newer versions
                    Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(
                        'assets/SourceSansPro-Regular.ttf',
                        'Source Sans Pro'
                    );

                    this.renderReport(template, reportData, parameters, localization, (report) => {
                        let mimetype: string;
                        
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
                                    settings = new Stimulsoft.Report.Export.StiExcelExportSettings(null);
                                    service = new Stimulsoft.Report.Export.StiExcel2007ExportService();
                                    break;
                                case 'csv':
                                    mimetype = 'application/csv';
                                    settings = new Stimulsoft.Report.Export.StiCsvExportSettings();
                                    service = new Stimulsoft.Report.Export.StiCsvExportService();
                                    break;
                                default:
                                    mimetype = 'application/pdf';
                                    settings = new Stimulsoft.Report.Export.StiPdfExportSettings();
                                    service = new Stimulsoft.Report.Export.StiPdfExportService();
                                    break;
                            }
    
                            const fileName = (!report.reportAlias || !report.reportAlias.length)
                                ? report.reportName
                                : report.reportAlias;
    
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
                                if (format == 'html') {
                                    let blob = new Blob([data], { type: mimetype })
                                    saveAs(blob, fileName + '.' + format);
                                } else {
                                    let blob = new Blob([new Int8Array(data)], { type: mimetype });
                                    saveAs(blob, fileName + '.' + format);
                                }
                            } else {
                                resolve(format === 'html'
                                    ? btoa(data)
                                    : fromByteArray(data));
                            }
                        }
                                                
                    });
                });
            }
        });
    }
}
