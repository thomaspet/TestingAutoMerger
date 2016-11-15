import {ViewChild, Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {SupplierInvoiceService, IStatTotal} from '../../../services/Accounting/SupplierinvoiceService';
import {SettingsService, ViewSettings} from '../../../services/services';
import {ToastService, ToastType} from '../../../../framework/unitoast/toastservice';
import {URLSearchParams} from '@angular/http';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';

declare const moment;

interface IFilter {
    name: string;
    label: string;
    isSelected?: boolean;
    count?: number;
    total?: number;
    filter?: string;
    showStatus?: boolean;
    showJournalID?: boolean;
    route?: string;
    onDataReady?: (data) => void;
}

@Component({
    selector: 'uni-bills',
    templateUrl: 'app/components/accounting/bill/bills.html'
})
export class BillsView {

    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(UniTable) private unitable: UniTable;
    private searchControl: FormControl = new FormControl('');

    public tableConfig: UniTableConfig;
    public listOfInvoices: Array<any> = [];
    public busy: boolean = true;
    public totals: { grandTotal: number } = { grandTotal: 0 };
    public searchTotals: { grandTotal: number, count: number } = { grandTotal: 0, count: 0 };
    public currentFilter: IFilter;
    private preSearchFilter: IFilter;
    private defaultPath: string;
    private viewSettings: ViewSettings;

    private hasQueriedInboxCount: boolean = false;
    private startupWithSearchText: string;
    private hasQueriedTotals: boolean = false;

    public filters: Array<IFilter> = [
        { label: 'Innboks', name: 'Inbox', route: 'filetags/incomingmail/0', onDataReady: (data) => this.onInboxDataReady(data), isSelected: true},
        { label: 'Kladd', name: 'Draft', filter: 'isnull(statuscode,30101) eq 30101', isSelected: false},
        { label: 'Tildelt', name: 'ForApproval', filter: 'statuscode eq 30102' },
        { label: 'Godkjent', name: 'Approved', filter: 'statuscode eq 30103' },
        { label: 'Bokført', name: 'Journaled', filter: 'statuscode eq 30104', showJournalID: true },
        { label: 'Betalingsliste', name: 'ToPayment', filter: 'statuscode eq 30105', showJournalID: true },
        { label: 'Betalt', name: 'Paid', filter: 'statuscode eq 30107 or statuscode eq 30106', showStatus: true, showJournalID: true },
        { label: 'Alle', name: 'All', filter: '', showStatus: true, showJournalID: true }
    ];

    constructor(
        private tabService: TabService,
        private supplierInvoiceService: SupplierInvoiceService,
        private toast: ToastService,
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        settingsService: SettingsService) {

            this.viewSettings = settingsService.getViewSettings('economy.bills.settings');
            tabService.addTab({ name: 'Regninger', url: '/accounting/bills', moduleID: UniModules.Bills, active: true });
            this.checkPath();
    }

    public ngOnInit() {

        if (this.startupWithSearchText) {
            this.refreshWihtSearchText(this.filterInput(this.startupWithSearchText));
        } else {
            this.refreshList(this.currentFilter, true);
        }

        this.searchControl.valueChanges
            .debounceTime(300)
            .subscribe((value: string) => {
                var v = this.filterInput(value);
                this.startupWithSearchText = v;
                this.refreshWihtSearchText(v);
        });
    }

    private refreshWihtSearchText(value: string) {
        var allFilter = this.filters.find( x => x.name === 'All');
        if (value) {
            var sFilter = this.createFilters(value, 'Info.Name', 'TaxInclusiveAmount', 'InvoiceNumber', 'ID');
            if (this.currentFilter.name !== allFilter.name ) { this.preSearchFilter = this.currentFilter; }
            this.onFilterClick(allFilter, sFilter);
        } else {
            if (this.preSearchFilter) {
                this.onFilterClick(this.preSearchFilter);
            }
        }
    }

    private createFilters(value: string, ...args: any[]): string {
        var result = '';
        args.forEach( (x, i) => {
            result += (i > 0 ? ' or ' : '') + `startswith(${x},'${value}')`;
        });
        return result;
    }

    private filterInput(v) {
        return v.replace(/[`~!@#$%^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    }

    private refreshList(filter?: IFilter, refreshTotals: boolean = false, searchFilter?: string) {
        this.busy = true;
        var params = new URLSearchParams();
        if (filter && filter.filter) {
            params.set('filter', filter.filter + ((searchFilter ? ' and ' : '') + (searchFilter || '')));
        } else if (searchFilter) {
            params.set('filter', searchFilter);
        }
        this.currentFilter = filter;
        var obs = obs = this.supplierInvoiceService.getInvoiceList(params);
        if (filter.route) {
            this.hasQueriedInboxCount = filter.name === 'Inbox';
            obs = this.supplierInvoiceService.fetch(filter.route);
        }
        obs.subscribe((result) => {
            if (filter.onDataReady) {
                filter.onDataReady(result);
            } else {
                this.listOfInvoices = result;
                this.makeSearchTotals();
                this.tableConfig = this.createTableConfig(filter);
                this.totals.grandTotal = filter.total || this.totals.grandTotal;
            }
            this.busy = false;

            this.QueryInboxTotals();
        });
        if (refreshTotals) {
            this.refreshTotals();
        }
    }

    private makeSearchTotals() {
        var sum = 0;
        if (this.listOfInvoices && this.listOfInvoices.length > 0) {
            this.listOfInvoices.forEach( x => {
                sum += x.TaxInclusiveAmount || 0;
            });
            this.searchTotals.grandTotal = sum;
            this.searchTotals.count = this.listOfInvoices.length;
        } else {
            this.searchTotals.grandTotal = 0;
            this.searchTotals.count = 0;
        }
    }

    private QueryInboxTotals(): boolean {
        if (this.hasQueriedInboxCount) {
            return false;
        }
        this.hasQueriedInboxCount = true;
        var route = '?model=filetag&select=count(id)&filter=tagname eq \'IncomingMail\' and status eq 0';
        this.supplierInvoiceService.getStatQuery(route).subscribe( data => {
            var filter = this.getInboxFilter();
            if (filter && data && data.length > 0) {
                filter.count = data[0].countid;
            }
        });
    }

    private getInboxFilter(): IFilter {
        return this.filters.find( x => x.name === 'Inbox');
    }

    private removeNullItems(data: Array<any>) {
        var n = data ? data.length : 0;
        if (n > 0) {
            for (var i = n - 1; i--; i >= 0) { if (data[i] === null) { data.splice(i, 1); console.log('Fjerner null-item pga.deleted file vs filetags i backend'); } }
        }
    }

    private onInboxDataReady(data: Array<any>) {
        // remove 'null' items
        this.removeNullItems(data);
        this.listOfInvoices = data;
        var filter = this.getInboxFilter();
        if (filter) {
            filter.count = data ? data.length : 0;
            filter.total = 0;
        }
        if (this.totals) { this.totals.grandTotal = 0; }
        var cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setWidth('4rem').setFilterOperator('startswith'),
            new UniTableColumn('Name', 'Filnavn').setWidth('18rem').setFilterOperator('startswith'),
            new UniTableColumn('Description', 'Tekst').setFilterOperator('contains'),
            new UniTableColumn('Size', 'Størrelse', UniTableColumnType.Number).setWidth('6rem').setFilterOperator('startswith'),
        ];
        var cfg = new UniTableConfig(false, true).setSearchable(false).setColumns(cols).setPageSize(12).setColumnMenuVisible(true).setDeleteButton(true);
        this.tableConfig = cfg;
    }

    private refreshTotals() {
        this.supplierInvoiceService.getInvoiceListGroupedTotals().subscribe((result: Array<IStatTotal>) => {
            this.hasQueriedTotals = true;
            this.filters.forEach(x => { if (x.name !== 'Inbox') { x.count = 0; x.total = 0; } } );
            var count = 0;
            var total = 0;
            result.forEach(x => {
                count += x.countid;
                total += x.sumTaxInclusiveAmount;
                var statusCode = x.SupplierInvoiceStatusCode ? x.SupplierInvoiceStatusCode.toString() : '0';
                var ix = this.filters.findIndex( y => y.filter ? y.filter.indexOf(statusCode) > 0 : false);
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
        if (item) {
            if (this.currentFilter.name === 'Inbox') {
                this.router.navigateByUrl('/accounting/bill/0?fileid=' + item.ID);
            } else {
                this.router.navigateByUrl('/accounting/bill/' + item.ID);
            }
        }
    }

    /*
    private deleteFileTags(fileId: number): Promise<boolean> {
        return new Promise( (resolve, reject) => {
        this.supplierInvoiceService.getStatQuery('?model=filetag&select=id&filter=fileid eq ' + fileId).subscribe( (tags) => {

            }).subscribe(()=> {

            });
        });
    }
    */

    private onPageChange(page) {
        console.log('active page is now ' + page);

        //for å skifte page:
        //this.unitable.goToPage(1);
    }

    public onRowDeleted(row) {
        if (this.currentFilter.name === 'Inbox') {
            var fileId = row.ID;
            if (fileId) {
                this.confirmModal.confirm('Slett aktuell fil: ' + row.Name, 'Sletting av fil').then( x => {

                    if (x === ConfirmActions.ACCEPT) {
                        this.supplierInvoiceService.send('files/' + fileId, undefined, 'DELETE').subscribe( (result) => {
                            this.toast.addToast('Filen er slettet', ToastType.good, 2);
                        }, (err) => {
                            var msg = (err._body ? JSON.parse(err._body).Message : err.statusText) || err.statusText;
                            this.toast.addToast(msg, ToastType.bad, 5);
                            this.refreshList(this.currentFilter);
                        });
                    } else {
                        this.refreshList(this.currentFilter);
                    }
                });
            }
        }
    }

    public onAddNew() {
        this.router.navigateByUrl('/accounting/bill/0');
    }

    public onFilterClick(filter: IFilter, searchFilter?: string) {
        this.filters.forEach(f => f.isSelected = false);
        this.refreshList(filter, !this.hasQueriedTotals , searchFilter);
        filter.isSelected = true;
        if (searchFilter) {
            this.location.replaceState(this.defaultPath + '?search=' + this.startupWithSearchText);
        } else {
            this.location.replaceState(this.defaultPath + '?filter=' + filter.name);
            this.viewSettings.setProp('defaultFilter', filter.name );
        }
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
                        if (parts[0] === 'search') {
                            this.startupWithSearchText = parts[1];
                        }
                    }
                });
            }
            this.defaultPath = this.defaultPath.substr(0, ix);
        }

        // Default-filter?
        if (this.currentFilter === undefined) {
            var name = this.viewSettings.getProp('defaultFilter', 'Inbox' );
            this.filters.forEach( x => {
                if (x.name === name) {
                    this.currentFilter = x;
                    x.isSelected = true;
                } else {
                    x.isSelected = false;
                }
            });
            if (!this.currentFilter) {
                this.currentFilter = this.filters[0];
            }
        }
    }

}
