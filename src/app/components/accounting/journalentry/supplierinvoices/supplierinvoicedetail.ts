import {Component, OnInit, provide, ViewChild, ComponentRef} from 'angular2/core';
import {Router, RouteParams, RouterLink} from "angular2/router";

import { Observable } from "rxjs/Observable";

import {SupplierInvoiceService, SupplierService, BankAccountService} from "../../../../services/services";

import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFormBuilder, UniFormLayoutBuilder} from "../../../../../framework/forms";
import {UniFieldsetBuilder, UniFieldBuilder, UniSectionBuilder} from "../../../../../framework/forms";
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {FieldType, FieldLayout, ComponentLayout} from "../../../../unientities";
import {SupplierInvoice, Supplier, BusinessRelation, StatusCategoryCode, BankAccount} from "../../../../unientities";

@Component({
    selector: "supplier-invoice-detail",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoicedetail.html",
    directives: [UniForm, UniComponentLoader, RouterLink],
    providers: [SupplierInvoiceService, SupplierService, BankAccountService]
})
export class SupplierInvoiceDetail implements OnInit {
    supplierInvoice: SupplierInvoice;
    suppliers: Supplier[];
    bankAccounts: BankAccount[];

    formBuilder: UniFormBuilder;
    formInstance: UniForm;

    @ViewChild(UniComponentLoader) uniCompLoader: UniComponentLoader;

    whenFormInstance: Promise<UniForm>;

    constructor(
        private _supplierInvoiceService: SupplierInvoiceService,
        private _supplierService: SupplierService,
        private _bankAccountService: BankAccountService,
        private router: Router,
        private _routeParams: RouteParams) {
    }

    ngOnInit() {
        var self = this;

        let id = +this._routeParams.get("id");

        if (id === null || typeof id === "undefined" || isNaN(id)) {
            Observable.forkJoin(
                self._supplierInvoiceService.GetNewEntity(),
                self._supplierService.GetAll(null, ["Info"]),
                self._bankAccountService.GetAll(null)
            ).subscribe((response: any) => {
                let [invoice, suppliers, bac] = response;
                self.supplierInvoice = invoice;
                self.suppliers = suppliers;
                self.bankAccounts = bac;

                self.buildForm2();
            }, error => console.log(error));
        }
        else {
            Observable.forkJoin(
                self._supplierInvoiceService.Get(id, ["JournalEntry", "Supplier.Info"]),
                self._supplierService.GetAll(null, ["Info"]),
                self._bankAccountService.GetAll(null)
            ).subscribe((response: any) => {
                let [invoice, suppliers, bac] = response;
                self.supplierInvoice = invoice;
                self.suppliers = suppliers;
                self.bankAccounts = bac;

                self.buildForm2();
            }, error => console.log(error));
        }
    }

    save(event: any) {
        var self = this;

        if (self.supplierInvoice.ID > 0) {
            if (self.supplierInvoice.SupplierID != 0)
                self.supplierInvoice.Supplier = null; //Needs to do this to avoid conflict between Supplier and SupplierID
            self._supplierInvoiceService.Put(self.supplierInvoice.ID, self.supplierInvoice)
                .subscribe((response: any) => {
                    self.supplierInvoice = response;
                    //alert(JSON.stringify(response));
                    //self.whenFormInstance.then((instance: UniForm) => instance.refresh(self.supplierInvoice));
                    self.router.navigateByUrl("/accounting/journalentry/supplierinvoices/");
                },
                (error: Error) => console.error('error in SupplierInvoiceDetail.onSubmit - Put: ', error))
        }
        else {
            //Following fields are required. For now hardcoded.
            self.supplierInvoice.CreatedBy = "TK";
            self.supplierInvoice.CurrencyCode = "NOK";

            self._supplierInvoiceService.Post(self.supplierInvoice)
                .subscribe((result: SupplierInvoice) => {
                    self.supplierInvoice = result;
                    self.smartBooking(self, true);
                },
                (error: Error) => console.error('error in SupplierInvoiceDetail.onSubmit - Post: ', error)
                );
        }
    }

    private onSubmit(context: SupplierInvoiceDetail) {
        var self = this;

        return () => {
            if (context.supplierInvoice.ID > 0) {
                if (context.supplierInvoice.SupplierID !== 0)
                    context.supplierInvoice.Supplier = null; //Needs to do this to avoid conflict between Supplier and SupplierID
                context._supplierInvoiceService.Put(context.supplierInvoice.ID, context.supplierInvoice)
                    .subscribe((response: any) => {
                        context.supplierInvoice = response;
                        //alert(JSON.stringify(response));
                        //context.whenFormInstance.then((instance: UniForm) => instance.refresh(context.supplierInvoice));

                        if (context.supplierInvoice.JournalEntryID == null || context.supplierInvoice.JournalEntryID ==0) {
                            context.smartBooking(context, false);
                        }
                        else {
                            self.router.navigateByUrl("/accounting/journalentry/supplierinvoices/");
                        }
                    },
                    (error: Error) => console.error('error in SupplierInvoiceDetail.onSubmit - Put: ', error))
            }
            else {
                //Following fields are required. For now hardcoded.
                context.supplierInvoice.CreatedBy = "TK";
                context.supplierInvoice.CurrencyCode = "NOK";

                context._supplierInvoiceService.Post(context.supplierInvoice)
                    .subscribe((result: SupplierInvoice) => {
                        context.supplierInvoice = result;
                        context.smartBooking(context, true);
                    },
                    (error: Error) => console.error('error in SupplierInvoiceDetail.onSubmit - Post: ', error)
                    );
            }
        };
    }

    //On hold
    //onSmartBook() {
    //    this.smartBooking(this, false);
    //}

    private smartBooking(context: SupplierInvoiceDetail, isNew: boolean) {
        var self = this;
        console.log("smartBooking called.")

        if (context.supplierInvoice.ID == null) {
            console.error("Smart booking can not be performed since SupplierInvoice.ID is null");
            return;
        }
        context._supplierInvoiceService.Action(context.supplierInvoice.ID, "smartbooking")
            .subscribe(
            (response: any) => {
                console.log("smartBooking completed.")
                self.router.navigateByUrl("/accounting/journalentry/supplierinvoices/");
                //alert(JSON.stringify(response));
                //if (isNew)
                //    self.router.navigateByUrl("/journalentry/supplierinvoices/" + self.supplierInvoice.ID);
                //else
                //    self.whenFormInstance.then((instance: UniForm) => instance.refresh(self.supplierInvoice));
            },
            (error: any) => console.log(error)
            );

    }

    buildForm2() {        
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = {
            Name: "SupplierInvoiceDetail",
            BaseEntity: "SupplierInvoice",
            StatusCode: 0,
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
                    StatusCode: 0,
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
                    FieldType: FieldType.DROPDOWN, //
                    ReadOnly: true,
                    LookupField: false,
                    Label: "Status", //
                    Description: "",
                    HelpText: "",
                    FieldSet: 0, ///
                    Section: 0, //
                    Legend: "",
                    StatusCode: 0,
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
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null
                },
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
                    StatusCode: 0,
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
                    StatusCode: 0,
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
                    StatusCode: 0,
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
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "BankAccount",
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Lev. kontonummer",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 2,
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
                    StatusCode: 0,
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
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "JournalEntryID",
                    //Property: "JournalEntry.JournalEntryNumber",
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
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: "SupplierInvoice",
                    Property: "FreeTxt",
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Merknad",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                }
            ]
        };

        this.formBuilder = new UniFormLayoutBuilder().build(view, this.supplierInvoice);
        //this.formBuilder.hideSubmitButton();
        this.extendFormConfig();
        this.loadForm();
    }
    statusTypes: Array<any> = [
        { Code: "1", Text: "Kladd" },
        { Code: "10000", Text: "Kladd" },
        { Code: "10001", Text: "Kladd" },
        { Code: "20000", Text: "Pending" },
        { Code: "30000", Text: "Active" },
        { Code: "40000", Text: "Fullført" },
        { Code: "50000", Text: "InActive" },
        { Code: "60000", Text: "Deviation" },
        { Code: "70000", Text: "Error" },
        { Code: "90000", Text: "Deleted" },

        { Code: "2", Text: "For godkjenning" },
        { Code: "30002", Text: "For godkjenning" },
        { Code: "30003", Text: "Godkjent" },
        { Code: "30004", Text: "Bokført" },
        { Code: "30005", Text: "Til betaling" },
        { Code: "30006", Text: "Delvis betalt" },
        { Code: "30007", Text: "Betalt" },
    ];

    extendFormConfig() {
        var fieldSupplierName: UniFieldBuilder = this.formBuilder.find('SupplierID');
        fieldSupplierName.setKendoOptions({
            dataTextField: 'Info.Name',
            dataValueField: 'ID',
            template: "${data.SupplierNumber} - ${data.Info.Name}",
            dataSource: this.suppliers
        });

        var fieldStatus: UniFieldBuilder = this.formBuilder.find('StatusCode');
        fieldStatus.setKendoOptions({
            dataTextField: 'Text',
            dataValueField: 'Code',
            dataSource: this.statusTypes
        });

        //TODO: Text control does not implement template.
        //var fieldJournalEntry: UniFieldBuilder = this.formBuilder.find('JournalEntryID');
        //fieldJournalEntry.setKendoOptions({
        //    template: "${data.JournalEntryID} - ${data.JournalEntry.JournalEntryNumber}"
        //});

        var fieldBank: UniFieldBuilder = this.formBuilder.find('BankAccount');
        fieldBank.setKendoOptions({
            dataTextField: 'AccountNumber',
            dataValueField: 'AccountNumber',
            dataSource: this.bankAccounts
        });

        
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

                //TODO: Implement when DRAFT is to be used..
                ////subscribe to valueChanges of form to autosave data after X seconds
                //self.formInstance.form
                //    .valueChanges
                //    .debounceTime(3000)
                //    .subscribe(
                //    (value) => {
                //        console.log('Value Changed');
                //        self.formInstance.updateModel();
                //        //self.saveCustomer(true);
                //    },
                //    (err) => {
                //        console.log('Feil oppsto:', err);
                //    }
                //    ); 

            });
        });
    }
}
