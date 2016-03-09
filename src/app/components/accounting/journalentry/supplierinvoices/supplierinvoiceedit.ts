import {Component, ViewChild, SimpleChange, Input, Output, EventEmitter} from "angular2/core";
import {UniModal} from "../../../../../framework/modals/modal";

import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, ISupplier, ISupplierInvoice, ISupplierInvoiceItem, IAccount} from "../../../../interfaces";
import {SupplierInvoiceService, SupplierService} from "../../../../services/services";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";


@Component({
    selector: "supplier-invoice-edit",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoiceedit.html",
    directives: [UniForm],
    providers: [SupplierInvoiceService]
})
export class SupplierInvoiceEdit {
    @Input() SupplierInvoice: ISupplierInvoice;

    @Output() Updated = new EventEmitter<ISupplierInvoice>();

    @ViewChild(UniForm)
    form: UniForm;

    formConfig = new UniFormBuilder();

    model: ISupplierInvoice;

    supplierInvoices: ISupplierInvoice[];

    constructor(private supplierInvoiceService: SupplierInvoiceService) {

    }

    ngOnInit() {

        if (this.SupplierInvoice != null) {
            this.model = this.SupplierInvoice;
        }

        //Get some of the lookup table information
        //Observable.forkJoin(
        //    //this.accountService.GetAll(null),
        //    this.supplierInvoiceService.GetAll(null)
        //)
        //    .subscribe(response => {
        //        //this.suppliers = response[0];
        //        this.supplierInvoices = response[0];

        //        this.buildForm();
        //    });
        this.buildForm();
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (this.SupplierInvoice != null) {
            this.model = this.SupplierInvoice;
            var self = this;

            //TODO: Remove timeout, needed for now to give angular time to set up form after this.model has been set
            setTimeout(() => {
                if (self.form != null)
                    self.form.refresh(self.model);
            }, 1000);
        }
    }

    onSubmit(value) {
        if (this.model.ID > 0) {
            this.supplierInvoiceService.Put(this.model.ID, this.model)
                .subscribe((response: any) => {
                    console.log("Response: ", response);
                    this.model = response;
                    this.Updated.emit(response);
                }, (error: any) => console.log(error));
        } else {
            this.supplierInvoiceService.Post(this.model)
                .subscribe(
                data => this.model = data,
                error => console.log("error in vatdetails.onSubmit: ", error)
                );
        }
    }

    buildForm() {
        var supplierInvoiceId = new UniFieldBuilder();
        supplierInvoiceId.setLabel("ID")
            .setModel(this.model)
            .setModelField("ID")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var invoiceDate = new UniFieldBuilder();
        invoiceDate.setLabel("Fakturadato")
            .setModel(this.model)
            .setModelField("InvoiceDate")
            .setKendoOptions({
                autocomplete: false
            })
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

        this.formConfig.addUniElements(
            supplierInvoiceId, invoiceDate
        );
    }
}
