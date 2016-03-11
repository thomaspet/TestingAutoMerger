import {Component, OnInit, provide, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams} from "angular2/router";

import { Observable } from "rxjs/Observable";

import {SupplierInvoiceService, SupplierService} from "../../../../services/services";

import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFormBuilder, UniFormLayoutBuilder} from "../../../../../framework/forms";
import {UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {FieldType} from "../../../../unientities";
import {SupplierInvoice} from "../../../../unientities";

@Component({
    selector: "supplier-invoice-detail",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoicedetail.html",
    directives: [UniForm],
    providers: [SupplierInvoiceService, SupplierService]
})
export class SupplierInvoiceDetail implements OnInit {
    supplierInvoice: SupplierInvoice; // = new SupplierInvoice();
    suppliers: Array<any> = [];
    formBuilder: UniFormBuilder = new UniFormBuilder();

    constructor(
        private _supplierInvoiceService: SupplierInvoiceService,
        private _supplierService: SupplierService,
        private _routeParams: RouteParams) {

    }

    ngOnInit() {

        let id = +this._routeParams.get("id");

        if (id === null || typeof id === "undefined" || isNaN(id)) {
            console.log("id is null");
            this.supplierInvoice = new SupplierInvoice();
            //Get drop down data TODO
        }
        else {
            Observable.forkJoin(
                this._supplierInvoiceService.Get(id, ["JournalEntry", "Supplier.Info"]),
                this._supplierService.GetAll(null)
            ).subscribe((response: any) => {
                let [invoice, suppliers] = response;
                this.supplierInvoice = invoice;
                this.suppliers = suppliers;

                setTimeout(() => {
                    this.buildForm();
                }, 1000);

                //this.layout = lt;
                //this.form = new UniFormLayoutBuilder().build(this.layout, this.SupplierInvoice);

                //this.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
                //    cmp.instance.config = this.form;

                //if (this.supplierInvoice != null) {
                //    //this.model = this.SupplierInvoice;

                //    setTimeout(() => {
                //        //this.form.refresh(this.supplierInvoice);
                //        this.formBuilder = this.buildForm();
                //    }, 1000);
                //}
            }, error => console.log(error));
        }

    }

    //    if (this.SupplierInvoice != null) {
    //        this.model = this.SupplierInvoice;
    //        var self = this;

    //        //TODO: Remove timeout, needed for now to give angular time to set up form after this.model has been set
    //        setTimeout(() => {
    //            if (self.form != null)
    //                self.form.refresh(self.model);
    //        }, 1000);
    //    }


    onSubmit() {
        console.log("Submit called...");
        if (this.supplierInvoice.ID > 0) {
            this._supplierInvoiceService.Put(this.supplierInvoice.ID, this.supplierInvoice)
                .subscribe((response: any) => {
                    console.log("Response: ", response);
                    this.supplierInvoice = response;
                }, (error: any) => console.log(error));
        } else {
            this._supplierInvoiceService.Post(this.supplierInvoice)
                .subscribe(
                data => this.supplierInvoice = data,
                error => console.log("Error in vatdetails.onSubmit: ", error)
                );
        }
    }

    buildForm() {
        //var fb = new UniFormBuilder();

        var supplierId = new UniFieldBuilder();
        supplierId.setLabel("LeverandørId")
            .setModel(this.supplierInvoice)
            .setModelField("Supplier.ID")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        //var supplierIdListe = new UniFieldBuilder();
        //supplierIdListe.setLabel('leverandør')
        //    .setModel(this.supplierInvoice)
        //    .setModelField('SupplierID')
        //    .setType(UNI_CONTROL_DIRECTIVES[3])
        //    .setKendoOptions({
        //        dataSource: this.suppliers,
        //        dataTextField: 'OrgNumber',
        //        dataValueField: 'ID',
        //        index: this.suppliers.indexOf(this.supplierInvoice.SupplierID)
        //    })
        //    .hasLineBreak(true);

        var supplierName = new UniFieldBuilder();
        supplierName.setLabel("Leverandørnavn")
            .setModel(this.supplierInvoice)
            .setModelField("Supplier.Info.Name")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var supplierInvoiceId = new UniFieldBuilder();
        supplierInvoiceId.setLabel("ID")
            .setModel(this.supplierInvoice)
            .setModelField("ID")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);


        //var invoiceDate = new UniFieldBuilder();
        //invoiceDate.setLabel("Fakturadato")
        //    .setModel(this.supplierInvoice)
        //    .setModelField("InvoiceDate")
        //    .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

        var invoiceDate = new UniFieldBuilder();
        invoiceDate.setLabel('Fakturadato2')
            .setModel(this.supplierInvoice)
            .setModelField('InvoiceDate')
            .setType(UNI_CONTROL_DIRECTIVES[2])
            .setKendoOptions({})
            .hasLineBreak(true);

        this.formBuilder.addUniElements(supplierInvoiceId, supplierId, supplierName, invoiceDate);

        //this.formBuilder = fb;
    }
}
