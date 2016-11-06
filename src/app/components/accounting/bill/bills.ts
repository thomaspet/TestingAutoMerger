import {Component} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {SupplierInvoiceService, IStatTotal} from '../../../services/Accounting/SupplierinvoiceService';
import {ToastService} from '../../../../framework/unitoast/toastservice';
import {URLSearchParams} from '@angular/http';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';

declare const moment;

interface IFilter {
    name: string;
    label: string;
    isSelected?: boolean;
    count?: number;
    total?: number;
    filter: string;
    showStatus?: boolean;
    showJournalID?: boolean;
}

@Component({
    selector: 'uni-bills',
    templateUrl: 'app/components/accounting/bill/bills.html'
})
export class BillsView {

    public tableConfig: UniTableConfig;
    public listOfInvoices: Array<any> = [];
    public busy: boolean = true;
    public totals: { grandTotal: number } = { grandTotal: 0 };
    public currentFilter: IFilter;
    private defaultPath: string;

    public filters: Array<IFilter> = [
        { label: 'Kladd', name: 'Draft', filter: 'isnull(statuscode,30101) eq 30101', isSelected: true},
        { label: 'Tildelt', name: 'ForApproval', filter: 'statuscode eq 30102' },
        { label: 'Godkjent', name: 'Approved', filter: 'statuscode eq 30103' },
        { label: 'Bokført', name: 'Journaled', filter: 'statuscode eq 30104', showJournalID: true },
        { label: 'Betales', name: 'ToPayment', filter: 'statuscode eq 30105', showJournalID: true },
        { label: 'Betalt', name: 'Paid', filter: 'statuscode eq 30107 or statuscode eq 30106', showStatus: true, showJournalID: true },
        { label: 'Alle', name: 'All', filter: '', showStatus: true, showJournalID: true }
    ];

    constructor(private tabService: TabService, private supplierInvoiceService: SupplierInvoiceService, private toast: ToastService, private location: Location, private route: ActivatedRoute, private router: Router) {
        tabService.addTab({ name: 'Regninger', url: '/accounting/bills', moduleID: UniModules.Bills, active: true });
        this.checkPath();
    }

    public ngOnInit() {
        this.refreshList(this.currentFilter, true);
    }

    private refreshList(filter?: IFilter, refreshTotals: boolean = false) {
        this.busy = true;
        var params = new URLSearchParams();
        if (filter && filter.filter) {
            params.set('filter', filter.filter);
        }
        this.currentFilter = filter;
        this.supplierInvoiceService.getInvoiceList(params).subscribe((result) => {
            this.listOfInvoices = result;
            this.tableConfig = this.createTableConfig(filter);
            this.busy = false;
            if (filter.total !== undefined ) { 
                this.totals.grandTotal = filter.total;
            }
        });
        if (refreshTotals) {
            this.refreshTotals();
        }
    }

    private refreshTotals() {
        this.supplierInvoiceService.getInvoiceListGroupedTotals().subscribe((result: Array<IStatTotal>) => {
            this.filters.forEach(x => { x.count = 0; x.total = 0; } );
            var count = 0;
            var total = 0;
            result.forEach(x => {
                count += x.countid;
                total += x.sumTaxInclusiveAmount;
                var statusCode = x.SupplierInvoiceStatusCode ? x.SupplierInvoiceStatusCode.toString() : '0';
                var ix = this.filters.findIndex( y => y.filter.indexOf(statusCode) > 0);
                if (ix >= 0) {
                    this.filters[ix].count += x.countid;
                    this.filters[ix].total += x.sumTaxInclusiveAmount;
                } 
            });
            let ixAll = this.filters.findIndex(x => x.name === 'All');
            this.filters[ixAll].count = count;
            this.filters[ixAll].total = total;
            this.totals.grandTotal = this.filters.find(x => x.isSelected).total;
        });     
    }

    private createTableConfig(filter: IFilter): UniTableConfig {
        var cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setWidth('5%').setFilterOperator('startswith'),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number).setVisible(!!filter.showStatus).setAlignment('center')
            .setTemplate((dataItem) => {
                return this.supplierInvoiceService.getStatusText(dataItem.StatusCode);
            }).setWidth('8%'),
            new UniTableColumn('SupplierSupplierNumber', 'Lev.nr.').setVisible(false).setWidth('4em'),
            new UniTableColumn('InfoName', 'Leverandør', UniTableColumnType.Text).setFilterOperator('startswith').setWidth('15em'),
            new UniTableColumn('PaymentDueDate', 'Forfall', UniTableColumnType.Date).setWidth('10%')            
                .setFilterOperator('eq')
                .setConditionalCls(item =>
                    moment(item.PaymentDueDate).isBefore(moment()) ? 'supplier-invoice-table-payment-overdue' : 'supplier-invoice-table-payment-ok'
                )
                .setFormat('DD.MM.YYYY'),
            new UniTableColumn('InvoiceNumber', 'Fakturanr').setWidth('8%'),
            new UniTableColumn('BankAccount', 'Bankgiro').setWidth('10%'),
            new UniTableColumn('PaymentID', 'KID/Melding').setWidth('10%')
                .setTemplate((item) => item.PaymentInformation || item.PaymentID),
            new UniTableColumn('JournalEntryJournalEntryNumber', 'Bilagsnr.').setWidth('8%').setVisible(!!filter.showJournalID)
                .setFilterOperator('startswith')
                .setTemplate(item => {
                    var key = item.JournalEntryJournalEntryNumber; 
                    if (key) { return `<a href="#/accounting/transquery/details;JournalEntryNumber=${key}">${key}</a>`; }
                }),
            new UniTableColumn('TaxInclusiveAmount', 'Beløp', UniTableColumnType.Money).setWidth('7em')
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
        if (item && item.ID) {
            this.router.navigateByUrl('/accounting/bill/' + item.ID);
            // this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/' + item.ID);
        }
    } 

    public onAddNew() {
        this.router.navigateByUrl('/accounting/bill/0');
    }

    public onFilterClick(filter: IFilter) {
        this.filters.forEach(f => f.isSelected = false);
        this.refreshList(filter);
        filter.isSelected = true;
        this.location.replaceState(this.defaultPath + '?filter=' + filter.name);
    }

    private checkPath() {
        this.defaultPath = this.location.path(true);
        var ix = this.defaultPath.indexOf('?');
        if (ix > 0) {
            var params = this.defaultPath.substr(ix + 1).split('&');
            if (params && params.length > 0) {
                params.forEach(element => {
                    var parts = element.split('=');
                    if (parts.length > 1) {
                        if (parts[0] === 'filter') {
                            this.currentFilter = this.filters.find(x => x.name === parts[1]);
                            this.filters.forEach(x => x.isSelected = false);
                            this.currentFilter.isSelected = true;
                        }
                    }
                });
            }
            this.defaultPath = this.defaultPath.substr(0, ix);
        } 
        if (this.currentFilter === undefined) {
            this.currentFilter = this.filters.find(x => x.isSelected);
        }
    }

}
