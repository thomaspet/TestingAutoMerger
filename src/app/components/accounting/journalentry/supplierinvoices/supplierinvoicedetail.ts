import {Component, OnInit, provide, ViewChild, ComponentRef} from 'angular2/core';
import {Router, RouteParams, RouterLink} from "angular2/router";

import { Observable } from "rxjs/Observable";

import {SupplierInvoiceService, SupplierService} from "../../../../services/services";

import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFormBuilder, UniFormLayoutBuilder} from "../../../../../framework/forms";
import {UniFieldsetBuilder, UniFieldBuilder, UniSectionBuilder} from "../../../../../framework/forms";
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {FieldType, FieldLayout, ComponentLayout} from "../../../../unientities";
import {SupplierInvoice, Supplier, BusinessRelation} from "../../../../unientities";

@Component({
    selector: "supplier-invoice-detail",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoicedetail.html",
    directives: [UniForm, UniComponentLoader, RouterLink],
    providers: [SupplierInvoiceService, SupplierService]
})
export class SupplierInvoiceDetail implements OnInit {
    supplierInvoice: SupplierInvoice;
    suppliers: Supplier[];

    formBuilder: UniFormBuilder;
    formInstance: UniForm;

    @ViewChild(UniComponentLoader) uniCompLoader: UniComponentLoader;

    whenFormInstance: Promise<UniForm>;

    constructor(
        private _supplierInvoiceService: SupplierInvoiceService,
        private _supplierService: SupplierService,
        private router: Router,
        private _routeParams: RouteParams) {
    }

    ngOnInit() {
        var self = this;

        let id = +this._routeParams.get("id");

        if (id === null || typeof id === "undefined" || isNaN(id)) {
            console.log("id is null");


            Observable.forkJoin(
                //self._supplierInvoiceService.getNewSupplierInvoice(["JournalEntry", "Supplier.Info"]), //TODO: GetNewEntity virker ikke
                self._supplierInvoiceService.GetNewEntity(), //TODO: GetNewEntity virker ikke
                self._supplierService.GetAll(null, ["Info"])
            ).subscribe((response: any) => {
                let [invoice, suppliers] = response;
                self.supplierInvoice = invoice;
                self.suppliers = suppliers;
                //self.suppliers = response;

                //self.supplierInvoice.Supplier = new Supplier();
                //self.supplierInvoice.Supplier.Info = new BusinessRelation();

                self.buildForm2();
            }, error => console.log(error));
        }
        else {

            Observable.forkJoin(
                self._supplierInvoiceService.Get(id, ["JournalEntry", "Supplier.Info"]),
                self._supplierService.GetAll(null, ["Info"])
            ).subscribe((response: any) => {
                let [invoice, suppliers] = response;
                self.supplierInvoice = invoice;
                self.suppliers = suppliers;

                self.buildForm2();
            }, error => console.log(error));
        }

    }

    private onSubmit(context: SupplierInvoiceDetail) {
        var self = this;

        return () => {
            if (context.supplierInvoice.ID > 0) {
                console.log("PUT Submit called...");
                if (context.supplierInvoice.SupplierID != 0)
                    context.supplierInvoice.Supplier = null; //Needs to do this to avoid conflict between Supplier and SupplierID
                context._supplierInvoiceService.Put(context.supplierInvoice.ID, context.supplierInvoice)
                    .subscribe((response: any) => {
                        context.supplierInvoice = response;
                        alert(JSON.stringify(response));
                        context.whenFormInstance.then((instance: UniForm) => instance.refresh(context.supplierInvoice));
                    },
                    (error: Error) => console.error('error in SupplierInvoiceDetail.onSubmit - Put: ', error))
            }
            else {
                console.log("POST Submit called...");
                //context.supplierInvoice.SupplierID = 1;
                //context.supplierInvoice.JournalEntryID = null;
                context.supplierInvoice.CreatedBy = "TK";
                context.supplierInvoice.CurrencyCode = "NOK";

                context._supplierInvoiceService.Post(context.supplierInvoice)
                    .subscribe((result: SupplierInvoice) => {
                        context.supplierInvoice = result;
                        context.smartBooking(context);
                    },
                    (error: Error) => console.error('error in SupplierInvoiceDetail.onSubmit - Post: ', error)
                    );
            }
        };
    }

    onSmartBook() {
        console.log("SMART BOOKING Triggered Manually");
        this.smartBooking(this);
    }

    private smartBooking(context: SupplierInvoiceDetail) {
        var self = this;

        console.log("SMART BOOKING ");
        if (context.supplierInvoice.ID === null) {
            console.error("Smart booking can not be performed since (SupplierInvoice.ID is null");
            return;
        }
        context._supplierInvoiceService.Action(context.supplierInvoice.ID, "smartbooking")
            .subscribe(
            (response: any) => {
                console.log("Smart booking completed");
                self.router.navigateByUrl("/journalentry/supplierinvoices/" + context.supplierInvoice.ID);
                //this.onSelect.emit(response);
            },
            (error: any) => console.log(error)
            );

    }
    buildForm2() {        
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = {
            Name: "SupplierInvoiceDetail",
            BaseEntity: "SupplierInvoice",
            StatusID: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "ID",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT, //
                    ReadOnly: true,
                    LookupField: false,
                    Label: "ID", //
                    Description: "",
                    HelpText: "",
                    FieldSet: 0, ///
                    Section: 0, //
                    Legend: "",
                    StatusID: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "StatusCode",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT, //
                    ReadOnly: true,
                    LookupField: false,
                    Label: "StatusCode", //
                    Description: "",
                    HelpText: "",
                    FieldSet: 0, ///
                    Section: 0, //
                    Legend: "",
                    StatusID: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "SupplierID",
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Leverandørnavn",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null
                },
                //{
                //    ComponentLayoutID: 2,
                //    EntityType: "Supplier",
                //    Property: "Supplier.BusinessRelationID",
                //    Placement: 2,
                //    Hidden: false,
                //    FieldType: FieldType.DROPDOWN,
                //    ReadOnly: false,
                //    LookupField: false,
                //    Label: "Leverandørnavn",
                //    Description: "",
                //    HelpText: "",
                //    FieldSet: 0,
                //    Section: 0,
                //    Legend: "",
                //    StatusID: 0,
                //    ID: 2,
                //    Deleted: false,
                //    CustomFields: null
                //},
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "InvoiceDate",
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Fakturadato",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 3,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "PaymentDueDate",
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Forfallsdato",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "TaxInclusiveAmount",
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Beløp",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "InvoiceID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Fakturanr",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "PaymentID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "KID",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "PaymentInformation",
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Bilagstekst",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "JournalEntryID",
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    LookupField: false,
                    Label: "Bilagsnr",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusID: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                }
                //TODO: Lev. Kontonr.; Bilagstekst, Merknad
            ]
        };

        this.formBuilder = new UniFormLayoutBuilder().build(view, this.supplierInvoice);
        //this.formBuilder.hideSubmitButton();
        this.extendFormConfig();
        this.loadForm();
    }

    extendFormConfig() {
        //var fieldSupplierName: UniFieldBuilder = this.formBuilder.find('Supplier.BusinessRelationID');
        //fieldSupplierName.setKendoOptions({
        //    dataTextField: 'Info.Name',
        //    dataValueField: 'ID',
        //    //template: "${data.ID} - ${data.Info.Name}",
        //    dataSource: this.suppliers
        //});  

        var fieldSupplierName: UniFieldBuilder = this.formBuilder.find('SupplierID');
        fieldSupplierName.setKendoOptions({
            dataTextField: 'Info.Name',
            dataValueField: 'ID',
            template: "${data.ID} - ${data.Info.Name}",
            dataSource: this.suppliers
        });  

        //var field: UniFieldBuilder = this.formBuilder.find('JournalEntryID');
        //field.setKendoOptions({
        //    dataTextField: 'Supplier.Info.Name',
        //    dataValueField: 'ID',
        //    template: getJournalEntryNumber(data),
        //    dataSource: this.supplierInvoice.
        //});
    }

    getJournalEntryNumber = (dataItem) => {
        var text = "";
        if (dataItem.JournalEntryID === null) return "BilagsID=null";
        if (dataItem.JournalEntry === null) return "Bilag=null";
        if (dataItem.JournalEntry.JournalEntryNumber === null) return "Bilagsnr =null";

        return dataItem.JournalEntry.JournalEntryNumber;
    }

    private buildFormConfig(layout: ComponentLayout, model: SupplierInvoice) {
        this.formBuilder = new UniFormLayoutBuilder().build(layout, model);
    }

    loadForm() {
        var self = this;
        return this.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
            cmp.instance.config = self.formBuilder;
            cmp.instance.getEventEmitter().subscribe(self.onSubmit(self));
            self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
            setTimeout(() => {
                self.formInstance = cmp.instance;
            });
        });
    }
}
