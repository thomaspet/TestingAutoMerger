import {Component, SimpleChange, Input, Output, EventEmitter, ViewChild, Type, OnInit} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";
import {Router, RouteParams, ROUTER_DIRECTIVES } from 'angular2/router';

import {JournalEntryService, JournalEntryLineService, SupplierInvoiceService, SupplierService, AccountService} from "../../../../services/services";

import {TabService} from "../../../layout/navbar/tabstrip/tabService";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../src/framework/controls";
import {UniModal} from "../../../../../framework/modals/modal";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";
import {UniTabs} from '../../../layout/uniTabs/uniTabs';

import {SupplierInvoiceEdit} from './supplierinvoiceedit';
import {SupplierInvoiceDetail} from './supplierinvoicedetail';


import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {SupplierInvoice} from "../../../../unientities";


@Component({
    selector: "supplier-invoice-list",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoicelist.html",
    providers: [SupplierInvoiceService, AccountService],
    directives: [SupplierInvoiceEdit, UniTable, UniModal, ROUTER_DIRECTIVES]
})
export class SupplierInvoiceList implements OnInit{
    @Output() onSelect = new EventEmitter<SupplierInvoice>();
    supplierInvoices: SupplierInvoice[];
    newSupplierInvoice: any;
    selectedSupplierInvoice: SupplierInvoice;

    @ViewChild(UniTable) table: any;

    supplierInvoiceTableCfg;
    private _selectedId: number;

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private accountService: AccountService,
        private _router: Router,
        routeParams: RouteParams)
    {
        //this._selectedId = +routeParams.get('id');
    }

    //TODO: To be retrieved from database schema shared.Status instead?
    statusTypes: Array<any> = [
        {ID: 0, Text: "Udefinert"},
        {ID: 1, Text: "Kladd"},
        {ID: 2, Text: "For godkjenning"},
        {ID: 3, Text: "Godkjent"},
        {ID: 4, Text: "Slettet"},
        {ID: 5, Text: "Bokf�rt"},
        {ID: 6, Text: "Til betaling"},
        {ID: 7, Text: "Delvis betalt"},
        {ID: 8, Text: "Betalt"},
        {ID: 9, Text: "Fullf�rt"}
    ];

    //TODO REFRESH???
    //testTableRefresh() {
    //    this.localData[0].Name = "Navn endret av refresh!";
    //    this.tables.toArray()[3].refresh(this.localData);
    //}

    getStatusText = (StatusID: string) => {
        var text = "";
        this.statusTypes.forEach((status) => {
            if (status.ID === StatusID) {
                text = status.Text;
                return;
            }
        });
        return text;
    }

    //TODO: Needs to use this for now since the UniTable throws exception if value is null.
    getJournalEntryNumber = (dataItem) => {
        var text = "";
        if (dataItem.JournalEntryID === null) return "BilagsID=null";
        if (dataItem.JournalEntry === null) return "Bilag=null";
        if (dataItem.JournalEntry.JournalEntryNumber === null) return "Bilagsnr =null";

        return dataItem.JournalEntry.JournalEntryNumber;
    }

    setupTableCfg() {
        var idCol = new UniTableColumn('ID', 'Id', 'number')
            .setEditable(false)
            .setNullable(true)
            .setWidth('4'); //Ser ikke ut til � virke

        //For test purpose only
        //var statusIdCol = new UniTableColumn('StatusID', 'StatusId', 'number')
        //    .setEditable(false)
        //    .setNullable(true);

        var statusTextCol = new UniTableColumn('StatusText', 'Status', 'string')
            .setTemplate((dataItem) => {
                return this.getStatusText(dataItem.StatusID);
            })
            .setEditable(false)
            .setNullable(true);

        var journalEntryCol = new UniTableColumn('JournalEntryID', 'Bilagsnr', 'string')
            .setTemplate((dataItem) => {
                return this.getJournalEntryNumber(dataItem);
            })
            .setEditable(false)
            .setNullable(true);

        //TODO when expand is working for supplier and supplier information is available
        var supplierNrCol = new UniTableColumn('Supplier.ID', 'Lev. id', 'string')
            .setEditable(false)
            .setNullable(true);

        //TODO: Test if the code handle if Supplier++ is not provided...
        var supplierNameCol = new UniTableColumn('Supplier.Info.Name', 'Lev. navn', 'string')
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

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Bel�p', 'number')
            .setEditable(false)
            .setNullable(true)
            .setClass("supplier-invoice-table-amount")
            .setFormat("{0:n}");
        //.setFormat("{0: #,###.##}");

        //CALLBACK
        var selectCallback = (selectedItem) => {
            console.log("selectCallback() called");
            this.selectedSupplierInvoice = selectedItem;

            //this._router.navigate(['SupplierinvoiceEdit', { id: selectedItem.ID }]);
            //this._router.navigateByUrl("/journalentry/supplierinvoices/Supplierinvoiceadd/" + selectedItem.ID);

            this._router.navigateByUrl("/journalentry/supplierinvoices/" + selectedItem.ID);
            //this.onSelect.emit(selectedItem);

            //this.setupModalConfig();
            //this.modalConfig.value = this.selectedSupplierInvoice;
            //this.modal.open();
        }

        //Different data sources:
        //**************************************************************
        //This config uses the datasource spcified in this component
        //this.supplierInvoiceTableCfg = new UniTableBuilder(response, false)
        //    .addColumns(idCol, statusTextCol, invoiceDateCol, paymentDueDateCol, invoiceIDCol, taxInclusiveAmountCol)
        //    .setSelectCallback(selectCallback)
        //    .setPageSize(5)
        //    .addCommands({ name: 'ContextMenu', text: '...', click: (event) => { event.preventDefault(); console.log(event) } });

        //This config uses UniTable's remote datasource
        this.supplierInvoiceTableCfg = new UniTableBuilder('SupplierInvoices', false)
            .addColumns(idCol, statusTextCol, journalEntryCol, supplierNrCol, supplierNameCol, invoiceDateCol, paymentDueDateCol, invoiceIDCol, taxInclusiveAmountCol)
            .setSelectCallback(selectCallback)
            .setExpand("JournalEntry, Supplier.Info")
            .setPageSize(5)
            .addCommands({
                name: 'ContextMenu', text: '...', click: (event) => {
                    event.preventDefault();
                    console.log(event)
                }
            });
    }

    //dataReady(response) {
    //    //Create table
    //    //this.setupTableCfg(response);
    //}

    ngOnInit() {
        this.setupTableCfg();

        //this.supplierInvoiceService.GetAll(null)
        //    .subscribe(response => {
        //        this.supplierInvoices = response;
        //        this.dataReady(response);
        //    });
    }

    supplierInvoiceUpdated(supplierInvoice: SupplierInvoice) {
        //TODO
        console.log("supplierInvoiceUpdated called");
        console.log(supplierInvoice);
        this.refreshTable();
    }

    refreshTable() {
        //TODO Throws exception today
        if (this.table !== null) {
            this.table.refresh();
        }
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
                    this.onSelect.emit(response);
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