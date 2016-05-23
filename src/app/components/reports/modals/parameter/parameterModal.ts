import {Component, ViewChild, Type, Input} from '@angular/core';
import {NgIf, NgModel, NgFor, NgClass} from '@angular/common';
import {Http} from '@angular/http';

import {UniModal} from '../../../../../framework/modals/modal';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {ReportDefinition} from '../../../../unientities';
import {ReportDefinitionParameter} from '../../../../unientities';

import {ReportDefinitionParameterService} from '../../../../services/services';

@Component({
    selector: 'report-parameter-modal-type',
    directives: [NgIf, NgModel, NgFor, NgClass, UniComponentLoader],
    templateUrl: 'app/components/reports/modals/parameter/parameterModal.html',
})
export class ReportparameterModalType {
    @Input('config')
    private config;

    constructor() {
        
    }
    
            
    ngAfterViewInit() {
    
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
    modal: UniModal;
    
    public modalConfig: any = {};
    public type: Type = ReportparameterModalType;
    
    public parameters : any;
    
    constructor(private reportDefinitionParameterService: ReportDefinitionParameterService,
                private http: Http)
    {
        var self = this;
        this.modalConfig = {
            title: 'Parametre',
            model: null,
            parameters: null,

            actions: [
                {
                    text: 'Ok',
                    method: () => {
                        self.modal.getContent().then(() => {
                            self.modal.close();
                        });
                        return false;
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        self.modal.getContent().then(() => {
                            self.modal.close();
                        });
                        return false;
                    }
                }
            ]
        };
    }

    ngAfterViewInit() {

    }
    
    public open(report: ReportDefinition)
    {
        this.modalConfig.title = report.Name;

        this.reportDefinitionParameterService.GetAll('ReportDefinitionId=' + report.ID).subscribe(params => {
            this.modalConfig.parameters = params;
            this.modal.open();        
        });
        
        /*this.http.get('/assets/ReportTemplates/' + report.TemplateLinkId) 
            .map(res => res.text())
            .subscribe(template => this.onTemplateLoaded(template),
            err => this.onError("Cannot load report template."));*/
    }
   
       
    private onTemplateLoaded(template : string) {
        // for test purpose only:
        // hardcoded invoice id
 /*       this.customerInvoiceService.Get(2)
            .subscribe(response => {
                this.reportWrapper.showReport(template, [JSON.stringify(response)], this.modalConfig);
                this.modal.open();        
            });*/
    }
   
    private onError(err : string) {
        alert(err)
    }
}
