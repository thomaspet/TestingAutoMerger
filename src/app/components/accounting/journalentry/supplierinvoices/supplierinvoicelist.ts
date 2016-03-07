import {Component, SimpleChange, Input, Output, EventEmitter, ViewChildren} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {FieldType, ISupplier, ISupplierInvoice, ISupplierInvoiceItem} from "../../../../../framework/interfaces/interfaces";
import {JournalEntryService, JournalEntryLineService, SupplierInvoiceService, SupplierService, AccountService} from "../../../../services/services";

import {TabService} from "../../../layout/navbar/tabstrip/tabService";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../src/framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";
import {UniTabs} from '../../../layout/uniTabs/uniTabs';

import {SupplierInvoiceEdit} from './supplierinvoiceedit';
import {UniHttp} from '../../../../../framework/core/http';

@Component({
    selector: "supplier-invoice-list",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoicelist.html",
    providers: [SupplierInvoiceService, AccountService],
    directives: [SupplierInvoiceEdit, UniTable]
})
export class SupplierInvoiceList {
    @Output() onSelect = new EventEmitter<ISupplierInvoice>();
    supplierInvoices: ISupplierInvoice[];
    newSupplierInvoice: any;
    selectedSupplierInvoice: any;

    @ViewChildren(UniTable) tables: any;

    supplierInvoiceTableCfg;

    constructor(private supplierInvoiceService: SupplierInvoiceService, private accountService: AccountService) { }

//TODO Get data by paging? 
        
//TODO map StatusID to some text
    //    this.localData = [
    //        { ID: 1, Name: 'Vare 1', Price: 10 },
    //        { ID: 2, Name: 'Vare 2', Price: 20 },
    //        { ID: 3, Name: 'Vare 3', Price: 30 },
    //        { ID: 4, Name: 'Vare 4', Price: 40 },
    //        { ID: 5, Name: 'Vare 5', Price: 50 },
    //        { ID: 6, Name: 'Vare 6', Price: 60 },
    //    ];

//TODO??        
        
    //    // Editable table working with local data
    //    uniHttpService
    //        .asGET()
    //        .usingBusinessDomain()
    //        .withEndPoint("products")
    //        .send({ top: 5 })
    //        .subscribe((response) => {
    //            this.editableLocalDataCfg = new UniTableBuilder(response, true)
    //                .setPageSize(5)
    //                .addColumns(idCol, nameCol, priceCol)
    //                .setUpdateCallback(updateCallback)
    //                .setCreateCallback(createCallback)
    //                .setDeleteCallback(deleteCallback);
    //        });
        
        

    //TODO REFRESH???
    //testTableRefresh() {
    //    this.localData[0].Name = "Navn endret av refresh!";
    //    this.tables.toArray()[3].refresh(this.localData);
    //}

    setupTableCfg() {
        console.log("setupTableCfg() called");
        var idCol = new UniTableColumn('ID', 'Id', 'number')
            .setEditable(false)
            .setNullable(true);

        var statusCol = new UniTableColumn('StatusID', 'Status', 'number')
            .setEditable(false)
            .setNullable(true);

        var invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', 'date')
            .setFormat("{0: dd.MM.yyyy}");

        var paymentDueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', 'date')
            .setClass("supplier-invoice-table-payment-overdue") //TODO: set only if date is expired.
            .setFormat("{0: dd.MM.yyyy}");

        var invoiceIDCol = new UniTableColumn('InvoiceID', 'Fakturanr', 'number')
            .setEditable(false)
            .setNullable(true);

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Beløp', 'number')
            .setEditable(false)
            .setNullable(true)
            .setClass("supplier-invoice-table-amount")
            .setFormat("{0:n}");
            //.setFormat("{0: #,###.##}");

        //CALLBACK
        var selectCallback = (selectedItem) => {
            console.log('Selected: ');
            console.log(selectedItem);
            this.selectedSupplierInvoice = selectedItem;
            this.onSelect.emit(selectedItem);
        }

        this.supplierInvoiceTableCfg = new UniTableBuilder('SupplierInvoices', false)
            .addColumns(idCol, statusCol, invoiceDateCol, paymentDueDateCol, invoiceIDCol, taxInclusiveAmountCol)
            .setSelectCallback(selectCallback)
            .setPageSize(5)
            .addCommands({ name: 'ContextMenu', text: '...', click: (event) => { event.preventDefault(); console.log(event) } });
    }

    dataReady() {
        console.log("dataReady called");

        //Create table
        this.setupTableCfg();
    }

    ngOnInit() {
        this.supplierInvoiceService.GetAll(null)
            .subscribe(response => {
                this.supplierInvoices = response;
                this.dataReady();
            });
    }

    supplierInvoiceUpdated(supplierInvoice: ISupplierInvoice) {
        //todo
    }

//#region "Test code"

    //*******************************  TEST DATA NOT AVAILABLE DIRECTLY YET  *********************************************//
    // THIS CODE TO BE REMOVED LATER
    //********************************************************************************************************************//
    syncAS() {
        console.log("SYNKRONISER KONTOPLAN");
        this.accountService.Action(null, "synchronize-ns4102-as")
            .subscribe(
            (response: any) => {
                alert("Kontoplan synkronisert for AS");
            },
            (error: any) => console.log(error)
            );
    }

    smartBooking() {
        console.log("SMART BOOKING NEW SUPPLIER INVOICE");
        if (this.newSupplierInvoice.ID === null) {
            console.error("Smart booking can not be performed since (this.newSupplierInvoice.ID is null");
            return;
        }
        this.supplierInvoiceService.Action(this.newSupplierInvoice.ID, "smartbooking")
            .subscribe(
            (response: any) => {
                console.log("Smart booking completed");
            },
            (error: any) => console.log(error)
            );
    }

    postSupplierInvoice() {
        var rand = Math.random() * 100000;
        var totalPrice = rand.toFixed(2);

        this.newSupplierInvoice = {
            "SupplierID": 1,
            "InvoiceDate": new Date(),
            "PaymentDueDate": new Date(),
            "InvoiceType": 0,
            "PaymentID": "123NEW",
            "PaymentInformation": null,
            "InvoiceID": 12,
            "Credited": false,
            "BankAccount": null,
            "Payment": null,
            "AmountRegards": null,
            "DeliveryName": null,
            "JournalEntryID": null,
            "InvoiceRecieverName": "Ola Norman",
            "InvoiceAddressLine1": null,
            "InvoiceAddressLine2": null,
            "InvoiceAddressLine3": null,
            "InvoicePostalCode": 0,
            "InvoiceCity": null,
            "InvoiceCountryCode": null,
            "InvoiceCountry": null,
            "ShippingAddressLine1": null,
            "ShippingAddressLine2": null,
            "ShippingAddressLine3": null,
            "ShippingPostalCode": 0,
            "ShippingCity": null,
            "ShippingCountryCode": null,
            "ShippingCountry": null,
            "OurReference": null,
            "YourReference": null,
            "SalesPerson": "Ola Salesman",
            "CustomerPerson": null,
            "DeliveryMethod": null,
            "PaymentTerm": null,
            "DeliveryTerm": null,
            "DeliveryDate": null,
            "Comment": null,
            "InternalNote": null,
            "FreeTxt": null,
            "TaxInclusiveAmount": totalPrice,
            "VatTotalsAmount": 0,
            "Attachments": null,
            "DimensionsID": 0,
            "CurrencyCode": "NOK",
            "CreatedBy": "Alan",
            "CreatedDate": null,
            "SupplierOrgNumber": null,
            "CustomerOrgNumber": null,
            "TaxInclusiveCurrencyAmount": 0,
            "TaxExclusiveCurrencyAmount": 0,
            "TaxExclusiveAmount": 0,
            "StatusID": null,
            "Deleted": false,
            "CustomValues": {}
        }

        this.supplierInvoiceService.Post(this.newSupplierInvoice)
            .subscribe(
                (response: any) => {
                    console.log(response);
                    this.newSupplierInvoice = response;
                    this.smartBooking();
                },
                (error: any) => {
                    console.log(error);
                }
        );
    }
//#endregion "Test code"
}