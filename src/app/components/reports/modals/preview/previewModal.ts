import {Component, ViewChild, Type, Input} from "angular2/core";
import {NgIf, NgModel, NgFor, NgClass} from "angular2/common";
import {Http, Headers} from 'angular2/http';
import {UniModal} from "../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";
import {StimulsoftReportWrapper} from "../../../../../framework/wrappers/reporting/reportWrapper";
import {CustomerInvoiceService, CustomerInvoiceItemService, CustomerService, SupplierService, ProjectService, DepartementService, AddressService} from '../../../../services/services';
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
    providers: [StimulsoftReportWrapper, CustomerInvoiceService]
})
export class PreviewModal {
    @ViewChild(UniModal)
    modal: UniModal;
    
    public modalConfig: any = {};
    type: Type = ReportPreviewModalType;

    constructor(public reportWrapper: StimulsoftReportWrapper,
                private customerInvoiceService: CustomerInvoiceService,
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
        // for test purpose only
        // @TODO: implement and use API resource
        
        this.http.get('/assets/DemoData/Demo.mrt') 
            .map(res => res.text())
            .subscribe(template => this.onTemplateLoaded(template),
            err => this.onError("Cannot load report template."));
    }
   
    private onTemplateLoaded(template : string) {
        // for test purpose only:
        // hardcoded invoice id
        this.customerInvoiceService.Get(1).subscribe(response => { 
            this.reportWrapper.showReport(template, [response], this.modalConfig);
            this.modal.open();        
        });
    }
   
    private onError(err : string) {
        alert(err)
    }
}
