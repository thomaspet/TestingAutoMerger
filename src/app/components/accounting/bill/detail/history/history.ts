import {Component, Input} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../../../framework/ui/unitable/index';
import {StatisticsService, SupplierInvoiceService, ErrorService} from '../../../../../services/services';
import {URLSearchParams} from '@angular/http';
import * as moment from 'moment';

@Component({
    selector: 'uni-bill-history',
    templateUrl: './history.html'
})
export class BillHistoryView {
    @Input() public supplierID: number;
    @Input() public parentID: number;

    public tableConfig: UniTableConfig;
    public listOfInvoices: Array<any> = [];
    public totals: { grandTotal: number } = { grandTotal: 0 };
    private lastUpdatedSupplierID: number = 0;

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private statisticsService: StatisticsService,
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

        const params = new URLSearchParams();
        params.set('filter', 'SupplierID eq ' + this.supplierID);
        params.set('top', '40');
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
        if (list && list.length > 0 && this.parentID) {
            const n = list.length - 1;
            for (let i = n; i >= 0; i--) {
                if (list[i].ID === this.parentID ) {
                    list.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    private createTableConfig(): UniTableConfig {
        const cols = [
            new UniTableColumn('InvoiceDate', 'Dato', UniTableColumnType.LocalDate).setWidth('5.5em')
                .setFilterOperator('eq')
                .setFormat('DD.MM.YY'),
            new UniTableColumn(
                'PaymentDueDate', 'Forfall', UniTableColumnType.LocalDate
            )
                .setWidth('4em')
                .setVisible(false)
                .setFilterOperator('eq')
                .setConditionalCls(item =>
                    moment(item.PaymentDueDate).isBefore(moment())
                        ? 'supplier-invoice-table-payment-overdue'
                        : 'supplier-invoice-table-payment-ok'
                )
                .setFormat('DD.MM.YY'),
            new UniTableColumn(
                'ID', 'Nr.', UniTableColumnType.Number
            ).setVisible(false).setWidth('3em').setFilterOperator('startswith'),
            new UniTableColumn(
                'StatusCode', 'Status', UniTableColumnType.Number
            ).setVisible(true).setAlignment('center').setTemplate((dataItem) => {
                return this.supplierInvoiceService.getStatusText(dataItem.StatusCode);
            }).setWidth('6em'),

            new UniTableColumn('InvoiceNumber', 'Fakturanr').setWidth('6em'),
            new UniTableColumn('BankAccount', 'Bankgiro').setVisible(false).setWidth('10%'),
            new UniTableColumn('PaymentID', 'KID/Melding').setVisible(false).setWidth('10%')
                .setTemplate((item) => item.PaymentInformation || item.PaymentID),
            new UniTableColumn('JournalEntryJournalEntryNumber', 'Bilagsnr.').setVisible(true)
                .setFilterOperator('startswith')
                .setLinkResolver(row => `/accounting/transquery;JournalEntryNumber=${row.JournalEntryJournalEntryNumber}`),

            new UniTableColumn('TaxInclusiveAmount', 'Beløp', UniTableColumnType.Money).setWidth('6em')
                .setFilterOperator('contains')
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
