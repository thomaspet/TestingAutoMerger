import {Component, ViewChild, Type, Input} from '@angular/core';
import {NgIf, NgModel, NgFor, NgClass} from '@angular/common';
import {Http} from '@angular/http';

import {UniModal} from '../../../../../framework/modals/modal';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {ReportDefinition} from '../../../../unientities';

import {ReportDefinitionParameterService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';

@Component({
    selector: 'report-parameter-modal-type',
    directives: [NgIf, NgModel, NgFor, NgClass, UniComponentLoader],
    templateUrl: 'app/components/reports/modals/parameter/parameterModal.html'
})
export class ReportparameterModalType {
    @Input('config')
    private config;

    constructor() {
        
    }
}

@Component({
    selector: 'report-parameter-modal',
    directives: [UniModal],
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    providers: [ReportDefinitionParameterService]
})
export class ParameterModal {
    @ViewChild(UniModal)
    private modal: UniModal;
    
    public modalConfig: any = {};
    public type: Type = ReportparameterModalType;
    
    private previewModal: PreviewModal;
    
    constructor(private reportDefinitionParameterService: ReportDefinitionParameterService,
                private http: Http)
    {
        this.modalConfig = {
            title: 'Parametre',
            model: null,
            report: new Object(),

            actions: [
                {
                    text: 'Ok',
                    method: () => {
                        this.modal.getContent().then(() => {
                            this.modal.close();
                            this.previewModal.open(this.modalConfig.report);
                        });
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.getContent().then(() => {
                            this.modal.close();
                        });
                    }
                }
            ]
        };
    }

    public open(report: ReportDefinition, previewModal: PreviewModal)
    {
        this.modalConfig.title = report.Name;
        this.modalConfig.report = report;
        this.previewModal = previewModal;

        this.reportDefinitionParameterService.GetAll('ReportDefinitionId=' + report.ID).subscribe(params => {
            this.modalConfig.report.parameters = params;
            this.modal.open();        
        });
    }
}
