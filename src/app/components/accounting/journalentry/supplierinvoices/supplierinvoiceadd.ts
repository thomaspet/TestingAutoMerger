import {Component, Injector, ViewChild, ComponentRef} from "angular2/core";
import {RouteParams} from "angular2/router";

import {UniForm} from "../../../../../framework/forms/uniForm";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";

import {UniFormBuilder} from "../../../../../framework/forms";
import {FieldType} from "../../../../unientities";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/merge";
import {UniSectionBuilder} from "../../../../../framework/forms/builders/uniSectionBuilder";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";

import {SupplierInvoice} from "../../../../unientities";
import {SupplierInvoiceService, SupplierService} from "../../../../services/services";

declare var jQuery;

@Component({
    selector: "supplier-invoice-add",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoiceadd.html",
    providers: [SupplierInvoiceService],
    directives: [UniComponentLoader, UniForm]
})
export class SupplierInvoiceAdd {
    SupplierInvoice: SupplierInvoice;
    CurrrentSupplierInvoice: SupplierInvoice;

    form: UniFormBuilder = new UniFormBuilder();
    layout;
    @ViewChild(UniComponentLoader) ucl: UniComponentLoader;

    SupplierInvoiceID;

    formInstance: UniForm;
    model;

    constructor(
        private _supplierInvoiceService: SupplierInvoiceService,
        private _injector: Injector) {
        // let params = Injector.parent.parent.get(RouteParams);
        // employeeDS.get(params.get("id"))
        // .subscribe(response => {
        //     this.currentEmployee = response;
        //     console.log(response);
        //     this.buildGroupConfigs();
        // },error => console.log(error));

        let params = _injector.parent.parent.get(RouteParams);
        //this.SupplierInvoiceID = params.get("id");
        this.SupplierInvoiceID = 1;
    }

    ngAfterViewInit() {
        var self = this;
        Observable.forkJoin(
            self._supplierInvoiceService.Get(1)
        ).subscribe(
            (response: any) => {
                self.CurrrentSupplierInvoice = response;

                self.form = self.buildGroupConfigs();
                self.form.hideSubmitButton();

                self.ucl.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = self.form;
                    setTimeout(() => {
                        self.formInstance = cmp.instance;
                    }, 100);

                });
            },
            (error: any) => console.error(error)
            );
    }
    buildGroupConfigs() {
        var formbuilder = new UniFormBuilder();

        //this.formConfig.hideSubmitButton();
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

        formbuilder.addUniElements(
            supplierInvoiceId, invoiceDate
        );

        this.form = formbuilder;
        return formbuilder;
    }

    onFormSubmit(event: any, index: number | string) {
        console.log("Submit called...");
    }
}