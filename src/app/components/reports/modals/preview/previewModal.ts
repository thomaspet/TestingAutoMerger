import {Component, ViewChild, Type, Input} from '@angular/core';
import {NgIf, NgModel, NgFor, NgClass} from '@angular/common';
import {Http} from '@angular/http';

import {ReportDefinition} from '../../../../unientities';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {ReportDefinitionService} from '../../../../services/services';
import {Report} from "../../../../models/reports/report";

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
    modal: UniModal;
    
    public modalConfig: any = {};
    public type: Type = ReportPreviewModalType;

    constructor(private reportDefinitionService: ReportDefinitionService,
                private http: Http)
    {
        var self = this;
        this.modalConfig = {
            title: 'Forhåndsvisning',
            model: null,

            actions: [
                {
                    text: 'Lukk',
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

    public open(report: ReportDefinition)
    {
        this.modalConfig.title = report.Name;
        this.reportDefinitionService.generateReportHtml(report, this);
        this.modal.open();
    }
   
    private onTemplateLoaded(template: string, report: ReportDefinition) {
        //this.reportDefinitionDataSourceService.GetAll('ReportDefinitionId=' + report.ID)
          //      .subscribe(dataSources => onDataSourcesLoaded(template, report, dataSources) );

        
        // for test purpose only:
        // hardcoded invoice id
        /*this.customerInvoiceService.Get(2)
            .subscribe(response => {
                this.reportWrapper.showReport(template, [JSON.stringify(response)], this.modalConfig);
                this.modal.open();        
            });*/
    }
  
 
/*    private resolvePlaceholders(report: ReportDefinition) {
        var urls: string[] = [];
        
        for (var param in report.parameters) {
            alert(param.Name);
        }
        return urls;
    }*/
   
    private onError(err : string) {
        alert(err)
    }
}
