import {Component, Input} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {StatisticsService, SupplierInvoiceService, ErrorService} from '../../../../../services/services';
import {URLSearchParams} from '@angular/http';

declare const moment;

@Component({
    selector: 'uni-bill-history',
    templateUrl: 'app/components/accounting/bill/detail/history/history.html'
})
export class BillHistoryView {

    @Input() public set supplierID(value: number ) {
        this.currentID = value || 0;
        this.checkRefresh();
    }
    @Input() public set isActive(value: boolean) {
        this._isActive = value;
        this.checkRefresh();
    }
    @Input() public parentID: number;

    public currentID: number = 0;
    public tableConfig: UniTableConfig;
    public listOfInvoices: Array<any> = [];
    public busy: boolean = false;
    public totals: { grandTotal: number } = { grandTotal: 0 };
    private lastUpdatedSupplierID: number = 0;

    private _isActive: boolean = false;

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {

    }

    public ngOnInit() {

    }

    private checkRefresh() {
        if (this._isActive) {
            this.refreshList();
        }
    }

    public getNumberOfInvoices(supplierId: number, excludeCurrentId?: number) {
        let query = `?model=supplierinvoice&select=count(id)&filter=isnull(deleted,0) eq 0 and supplierId eq ${supplierId}`;
        if (excludeCurrentId) {
            query += ` and ( not id eq ${excludeCurrentId} )`;
        }
        return this.supplierInvoiceService.getStatQuery(query).map( x => {
            if (x && x.length > 0) {
                return x[0].countid;
            }
        });
    }

    private refreshList() {

        // No change?
        if (this.lastUpdatedSupplierID === this.currentID) {
            return;
        }

        this.lastUpdatedSupplierID = this.currentID;

        if (!this.currentID) {
            this.listOfInvoices.length = 0;
            this.tableConfig = this.createTableConfig();
            this.totals.grandTotal = 0;
            return;
        }

        this.busy = true;
        var params = new URLSearchParams();
        params.set('filter', 'SupplierID eq ' + this.currentID);
        params.set('top', '40');
        this.supplierInvoiceService.getInvoiceList(params)
            .finally(() => this.busy = false)
            .subscribe( list => {
            this.removeSelfFromList(list);
            this.sumList(list);
            this.listOfInvoices = list;
            this.tableConfig = this.createTableConfig();
        },
            err => this.errorService.handle(err)
        );

    }

    private sumList(list: Array<any>) {
        var sum = 0;
        list.forEach( x => sum += (x.TaxInclusiveAmount || 0) );
        this.totals.grandTotal = sum;
    }

    private removeSelfFromList(list: Array<any>): boolean {
        if (list && list.length > 0 && this.parentID) {
            let n = list.length - 1;
            for (var i = n; i >= 0; i--) {
                if (list[i].ID === this.parentID ) {
                    list.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    private createTableConfig(): UniTableConfig {
        var cols = [
            new UniTableColumn('InvoiceDate', 'Dato', UniTableColumnType.LocalDate).setWidth('5.5em')
                .setFilterOperator('eq')
                .setFormat('DD.MM.YY'),
            new UniTableColumn('PaymentDueDate', 'Forfall', UniTableColumnType.LocalDate).setWidth('4em').setVisible(false)
                .setFilterOperator('eq')
                .setConditionalCls(item =>
                    moment(item.PaymentDueDate).isBefore(moment()) ? 'supplier-invoice-table-payment-overdue' : 'supplier-invoice-table-payment-ok'
                )
                .setFormat('DD.MM.YY'),            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setVisible(false).setWidth('3em').setFilterOperator('startswith'),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number).setVisible(true).setAlignment('center')
            .setTemplate((dataItem) => {
                return this.supplierInvoiceService.getStatusText(dataItem.StatusCode);
            }).setWidth('6em'),

            new UniTableColumn('InvoiceNumber', 'Fakturanr').setWidth('6em'),
            new UniTableColumn('BankAccount', 'Bankgiro').setVisible(false).setWidth('10%'),
            new UniTableColumn('PaymentID', 'KID/Melding').setVisible(false).setWidth('10%')
                .setTemplate((item) => item.PaymentInformation || item.PaymentID),
            new UniTableColumn('JournalEntryJournalEntryNumber', 'Bilagsnr.').setVisible(true)
                .setFilterOperator('startswith')
                .setTemplate(item => {
                    var key = item.JournalEntryJournalEntryNumber;
                    if (key) { return `<a href="#/accounting/transquery/details;JournalEntryNumber=${key}">${key}</a>`; }
                }),
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
        return new UniTableConfig(false, true).setSearchable(false).setColumns(cols).setPageSize(12).setColumnMenuVisible(true);
    }

    public onRowSelected(event) {
        var item = event.rowModel;
        if (item) {

        }
    }

}
