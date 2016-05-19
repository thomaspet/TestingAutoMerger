import {Component, ViewChild, Type, Input} from "@angular/core";
import {NgIf, NgModel, NgFor, NgClass} from "@angular/common";
import {Http, Headers} from '@angular/http';
import {UniModal} from "../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";
import {StimulsoftReportWrapper} from "../../../../../framework/wrappers/reporting/reportWrapper";
import {Observable} from 'rxjs/Observable';

@Component({
    selector: "report-preview-modal-type",
    directives: [NgIf, NgModel, NgFor, NgClass, UniComponentLoader],
    templateUrl: "app/components/reports/modals/preview/previewModal.html",
})
export class ReportPreviewModalType {
    @Input('config')
    config;
    
    constructor() {
        
    }
    
            
    ngAfterViewInit() {
    
    }
}



@Component({
    selector: "report-preview-modal",
    directives: [UniModal],
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    providers: [StimulsoftReportWrapper/*, CustomerInvoiceService*/]
})
export class PreviewModal {
    @ViewChild(UniModal)
    modal: UniModal;
    
    public modalConfig: any = {};
    type: Type = ReportPreviewModalType;

    constructor(public reportWrapper: StimulsoftReportWrapper,
                //private customerInvoiceService: CustomerInvoiceService,
                private http: Http)
    {
        var self = this;
        this.modalConfig = {
            title: "Forhåndsvisning",
            model: null,
            report: null,

            actions: [
                {
                    text: "Lukk",
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
    
    public open()
    {
        // @TMP:
        // In the version deadlined 06.30.2016 embedded report types are supported only.
        // Template files are stored on front end side.

        this.http.get('/assets/ReportTemplates/Demo.mrt') 
            .map(res => res.text())
            .subscribe(template => this.onTemplateLoaded(template),
            err => this.onError("Cannot load report template."));
    }
   
    private onTemplateLoaded(template : string) {
        // for test purpose only:
        // hardcoded invoice id
        /*this.customerInvoiceService.Get(2)
            .subscribe(response => {
                this.reportWrapper.showReport(template, [JSON.stringify(response)], this.modalConfig);
                this.modal.open();        
            });*/
    }
   
    private onError(err : string) {
        alert(err)
    }
}
