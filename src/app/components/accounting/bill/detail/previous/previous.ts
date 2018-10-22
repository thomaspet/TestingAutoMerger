import {Component, Input, ViewChild} from '@angular/core';
import {FieldType, UniForm, UniFormError} from '@uni-framework/ui/uniform/index';
import {SupplierInvoiceService, ErrorService} from '../../../../../services/services';
import {BehaviorSubject} from 'rxjs';
import {SupplierInvoice} from '@uni-entities';

@Component({
    selector: 'uni-bill-previous',
    templateUrl: './previous.html'
})
export class BillPreviousView {
    @Input() public supplierID: number;
    @Input() public supplierInvoiceID: number;
    @ViewChild(UniForm) private uniForm: UniForm;

    public uniformConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public uniformFields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public supplierInvoice$: BehaviorSubject<SupplierInvoice> = new BehaviorSubject(null);

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        if (this.uniForm) {
            this.uniForm.readMode();
        }
    }

    public ngOnChanges() {
        if (this.supplierID) {
            const currentfilter = this.supplierInvoiceID ? ` and id lt ${this.supplierInvoiceID}` : ``;
            this.supplierInvoiceService.GetOneByQuery(
                `filter=statuscode ge 30104 and supplierid eq ${this.supplierID}${currentfilter}&` +
                `orderby=invoicedate desc`
            ).subscribe(supplierInvoice => {
                this.supplierInvoice$.next(supplierInvoice);
                this.getFormLayout();
            });
        }
    }

    private getFormLayout() {
        this.uniformFields$.next([
            {
                EntityType: 'SupplierInvoice',
                Property: 'InvoiceNumber',
                FieldType: FieldType.TEXT,
                Label: 'Fakturanummer',
                FieldSet: 0,
                Section: 0
            },
            {
                EntityType: 'SupplierInvoice',
                Property: 'InvoiceDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Fakturadato',
                FieldSet: 0,
                Section: 0
            }
        ]);
    }
}
