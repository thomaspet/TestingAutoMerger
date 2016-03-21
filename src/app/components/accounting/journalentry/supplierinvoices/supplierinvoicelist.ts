import {Component, SimpleChange, Input, Output, EventEmitter, ViewChild, Type, OnInit} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";
import {ComponentInstruction, Router, RouteParams } from 'angular2/router';

import {JournalEntryService, JournalEntryLineService, SupplierInvoiceService, SupplierService, AccountService} from "../../../../services/services";

import {TabService} from "../../../layout/navbar/tabstrip/tabService";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../src/framework/controls";
import {UniModal} from "../../../../../framework/modals/modal";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";
import {UniTabs} from '../../../layout/uniTabs/uniTabs';

import {SupplierInvoiceDetail} from './supplierinvoicedetail';


import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {SupplierInvoice} from "../../../../unientities";

declare var jQuery;

@Component({
    selector: "supplier-invoice-list",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoicelist.html",
    providers: [SupplierInvoiceService, AccountService],
    directives: [UniTable, UniModal]
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
    }

    //TODO: To be retrieved from database schema shared.Status instead?
    statusTypes: Array<any> = [
        {ID: 0, Text: "Udefinert"},
        {ID: 1, Text: "Kladd"},
        {ID: 2, Text: "For godkjenning"},
        {ID: 3, Text: "Godkjent"},
        {ID: 4, Text: "Slettet"},
        {ID: 5, Text: "Bokført"},
        {ID: 6, Text: "Til betaling"},
        {ID: 7, Text: "Delvis betalt"},
        {ID: 8, Text: "Betalt"},
        {ID: 9, Text: "Fullført"}
    ];

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
        if (dataItem.JournalEntry.JournalEntryNumber === null) return "Kladdebilag";

        return dataItem.JournalEntry.JournalEntryNumber;
    }

    setupTableCfg() {
        var self = this;

        var idCol = new UniTableColumn('ID', 'Id', 'number')
            .setEditable(false)
            .setNullable(true)
            .setWidth('4'); //Ser ikke ut til å virke

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
            .setClass("supplier-invoice-table-payment-overdue") //TODO: Set only if date is expired.
            .setFormat("{0: dd.MM.yyyy}");

        var invoiceIDCol = new UniTableColumn('InvoiceID', 'Fakturanr', 'number')
            .setEditable(false)
            .setNullable(true);

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Beløp', 'number')
            .setEditable(false)
            .setNullable(true)
            .setClass("supplier-invoice-table-amount")
            .setFormat("{0:n}");
        //.setFormat("{0: #,###.##}"); //TODO decide what/how format is set for the different field types

        //CALLBACKs
        var selectCallback = (selectedItem) => {
            this.selectedSupplierInvoice = selectedItem;
            this.onSelect.emit(selectedItem);
        }

        this.supplierInvoiceTableCfg = new UniTableBuilder('SupplierInvoices', false)
            .addColumns(idCol, statusTextCol, journalEntryCol, supplierNrCol, supplierNameCol, invoiceDateCol, paymentDueDateCol, invoiceIDCol, taxInclusiveAmountCol)
            .setSelectCallback(selectCallback)
            .setExpand("JournalEntry, Supplier.Info")
            .setPageSize(5)
            .addCommands({
                name: 'ContextMenu', text: '...', click: (function (event) {
                    event.preventDefault();
                    var dataItem = this.dataItem(jQuery(event.currentTarget).closest("tr"));

                    if (dataItem !== null && dataItem.ID !== null) {
                        self.selectedSupplierInvoice = dataItem;
                        self._router.navigateByUrl("/journalentry/supplierinvoices/" + dataItem.ID);
                    }
                    else
                        console.log("Error in selecting the SupplierInvoices");
                })
            });
    }

    ngOnInit() {
        this.setupTableCfg();
    }
}