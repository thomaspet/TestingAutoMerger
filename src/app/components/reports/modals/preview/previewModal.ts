import {Component, ViewChild, Type, Input} from '@angular/core';
import {NgIf, NgModel, NgFor, NgClass} from '@angular/common';
import {Http} from '@angular/http';

import {ReportDefinition} from '../../../../unientities';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {ReportDefinitionService,Report,ReportParameter} from '../../../../services/services';

@Component({
    selector: 'report-preview-modal-type',
    directives: [NgIf, NgModel, NgFor, NgClass, UniComponentLoader],
    templateUrl: 'app/components/reports/modals/preview/previewModal.html',
})
export class ReportPreviewModalType {
    @Input('config')
    private config;
    
    constructor() {
        
    }
}

@Component({
    selector: 'report-preview-modal',
    directives: [UniModal],
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    providers: [ReportDefinitionService]
})
export class PreviewModal {
    @ViewChild(UniModal)
    private modal: UniModal;
    
    public modalConfig: any = {};
    public type: Type = ReportPreviewModalType;
    
    private reportDefinition: ReportDefinition;

    constructor(private reportDefinitionService: ReportDefinitionService,
                private http: Http)
    {
        var self = this;
        this.modalConfig = {
            title: 'Forhåndsvisning',
            model: null,

            actions: [
                {
                    text: 'Skriv ut',
                    method: () => {
                        self.modal.getContent().then(() => {
                            this.reportDefinitionService.generateReportPdf(this.reportDefinition);
                            self.modal.close();
                        });
                    }
                },
                {
                    text: 'Lukk',
                    method: () => {
                        self.modal.getContent().then(() => {
                            self.modal.close();
                        });
                    }
                }
            ]
        };
    }
    
    public openWithId(report: Report, id: number) {
        var idparam = new ReportParameter();
        idparam.Name = "Id";
        idparam.value = id.toString();
        report.parameters = [idparam];

        this.open(report);
    }

    public open(report: Report) {
        this.modalConfig.title = report.Name;
        this.modalConfig.report = null;
        this.reportDefinition = report;
        this.reportDefinitionService.generateReportHtml(report, this.modalConfig);
        this.modal.open();
    }
}
