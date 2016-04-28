import {Component, ViewChild, Type, Input} from "angular2/core";
import {NgIf, NgModel, NgFor, NgClass} from "angular2/common";
import {UniModal} from "../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";
import {StimulsoftReportWrapper} from "../../../../../framework/wrappers/reporting/reportWrapper";

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
    providers: [StimulsoftReportWrapper]
})
export class PreviewModal {
    @ViewChild(UniModal)
    modal: UniModal;
    
    public modalConfig: any = {};
    type: Type = ReportPreviewModalType;

    constructor(public reportWrapper: StimulsoftReportWrapper)
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
        this.reportWrapper.start(this.modalConfig);
        this.modal.open();
    }
}