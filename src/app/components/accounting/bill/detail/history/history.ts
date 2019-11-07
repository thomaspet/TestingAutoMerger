import {Component, Input} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../../../framework/ui/unitable/index';
import {SupplierInvoiceService, ErrorService} from '../../../../../services/services';
import {HttpParams} from '@angular/common/http';
import * as moment from 'moment';

@Component({
    selector: 'uni-bill-history',
    templateUrl: './history.html'
})
export class BillHistoryView {
    @Input() public supplierID: number;
    @Input() public supplierInvoiceID: number;

    public tableConfig: UniTableConfig;
    public listOfInvoices: Array<any> = [];
    public totals: { grandTotal: number } = { grandTotal: 0 };
    private lastUpdatedSupplierID: number = 0;

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private errorService: ErrorService
    ) {}

    public ngOnChanges() {
        if (this.supplierID) {
            this.refreshList();
        }
    }

    private refreshList() {
        if (this.lastUpdatedSupplierID === this.supplierID) {
            return;
        }

        this.lastUpdatedSupplierID = this.supplierID;

        if (!this.supplierID) {
            this.listOfInvoices.length = 0;
            this.tableConfig = this.createTableConfig();
            this.totals.grandTotal = 0;
            return;
        }

        const params = new HttpParams()
            .set('filter', 'SupplierID eq ' + this.supplierID)
            .set('top', '40');

        this.supplierInvoiceService.getInvoiceList(params).subscribe(
            list => {
                this.removeSelfFromList(list);
                this.sumList(list);
                this.listOfInvoices = list;
                this.tableConfig = this.createTableConfig();
            },
            err => this.errorService.handle(err)
        );

    }

    private sumList(list: Array<any>) {
        let sum = 0;
        list.forEach( x => sum += (x.TaxInclusiveAmount || 0) );
        this.totals.grandTotal = sum;
    }

    private removeSelfFromList(list: Array<any>): boolean {
        if (list && list.length > 0 && this.supplierInvoiceID) {
            const n = list.length - 1;
            for (let i = n; i >= 0; i--) {
                if (list[i].ID === this.supplierInvoiceID) {
                    list.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    private createTableConfig(): UniTableConfig {
        const cols = [
            new UniTableColumn('InvoiceDate', 'Dato', UniTableColumnType.LocalDate)
                .setWidth('6rem'),
            new UniTableColumn(
                'PaymentDueDate', 'Forfall', UniTableColumnType.LocalDate
            )
                .setVisible(false)
                .setConditionalCls(item =>
                    moment(item.PaymentDueDate).isBefore(moment())
                        ? 'supplier-invoice-table-payment-overdue'
                        : 'supplier-invoice-table-payment-ok'
                ),
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setVisible(false),
            new UniTableColumn('StatusCode', 'Status')
                .setTemplate((dataItem) => {
                    return this.supplierInvoiceService.getStatusText(dataItem.StatusCode);
                }),

            new UniTableColumn('InvoiceNumber', 'Fakturanr'),
            new UniTableColumn('BankAccount', 'Bankgiro').setVisible(false),
            new UniTableColumn('PaymentID', 'KID/Melding').setVisible(false)
                .setTemplate((item) => item.PaymentInformation || item.PaymentID),
            new UniTableColumn('JournalEntryJournalEntryNumber', 'Bilagsnr.').setVisible(true)
                .setLinkResolver(row => {
                    const numberAndYear = row.JournalEntryJournalEntryNumber.split('-');
                    if (numberAndYear.length > 1) {
                        return `/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=${numberAndYear[1]}`;
                    } else {
                        const year = row.InvoiceDate ? new Date(row.InvoiceDate).getFullYear() : new Date().getFullYear();
                        return `/accounting/transquery?JournalEntryNumber=${row.JournalEntryJournalEntryNumber}&AccountYear=${year}`;
                    }
                }),

            new UniTableColumn('TaxInclusiveAmount', 'Beløp', UniTableColumnType.Money).setWidth('6rem')
                .setConditionalCls(item =>
                    item.TaxInclusiveAmount >= 0 ? 'supplier-invoice-table-plus' : 'supplier-invoice-table-minus'
                ),
            new UniTableColumn('ProjectName', 'Prosjektnavn').setVisible(false),
            new UniTableColumn('ProjectProjectNumber', 'ProsjektNr.').setVisible(false),
            new UniTableColumn('DepartmentName', 'Avdelingsnavn').setVisible(false),
            new UniTableColumn('DepartmentDepartmentNumber', 'Avd.nr.').setVisible(false),

        ];
        return new UniTableConfig('accounting.bill.history', false, true)
            .setSearchable(false)
            .setColumns(cols)
            .setPageSize(12)
            .setColumnMenuVisible(true);
    }
}
