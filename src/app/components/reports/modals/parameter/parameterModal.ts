import {Component, ViewChild, Type, Input} from '@angular/core';
import {Http, URLSearchParams} from '@angular/http';

import {UniModal} from '../../../../../framework/modals/modal';
import {ReportDefinition, ReportDefinitionParameter} from '../../../../unientities';
import {StatisticsService} from '../../../../services/services';

import {ReportDefinitionParameterService} from '../../../../services/services';
import {PreviewModal} from '../preview/previewModal';
import {ErrorService} from '../../../../services/common/ErrorService';

@Component({
    selector: 'report-parameter-modal-type',
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
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class ParameterModal {
    @ViewChild(UniModal)
    private modal: UniModal;
    
    public modalConfig: any = {};
    public type: Type<any> = ReportparameterModalType;
    
    private previewModal: PreviewModal;
    
    constructor(
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private http: Http,
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    )
    {
        this.modalConfig = {
            title: 'Parametre',
            model: null,
            report: new Object(),

            actions: [
                {
                    text: 'Ok',
                    class: 'good',
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

        this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + report.ID).subscribe(params => {
            // Find param value to be replaced
            let param: CustomReportDefinitionParameter = params.find(x => ['InvoiceNumber', 'OrderNumber', 'QuoteNumber'].indexOf(x.Name) >= 0);
            if (param) {
                let statparams = new URLSearchParams();
                statparams.set('model', 'NumberSeries');
                statparams.set('select', 'NextNumber');

                switch (param.Name) {
                    case 'InvoiceNumber':
                        statparams.set('filter', 'Name eq \'Customer Invoice number series\'');
                        break;
                    case 'OrderNumber':
                        statparams.set('filter', 'Name eq \'Customer Order number series\'');
                        break;
                    case 'QuoteNumber':
                        statparams.set('filter', 'Name eq \'Customer Quote number series\'');
                        break;
                }

                // Get param value
                this.statisticsService.GetDataByUrlSearchParams(statparams).subscribe(stat => {
                    let val = stat.Data[0].NumberSeriesNextNumber - 1;
                    if (val > 0) { param.value = val; }

                    this.modalConfig.report.parameters = params;
                    this.modal.open();        
                }, err => this.errorService.handle(err));
            } else {
                this.modalConfig.report.parameters = params;
                this.modal.open();        
            }
        }, err => this.errorService.handle(err));
    }
}

class CustomReportDefinitionParameter extends ReportDefinitionParameter {
    public value: any;
}
