import {ViewChild, Component, HostListener} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {UniTableColumn, UniTableColumnType, UniTableConfig, UniTable} from '../../../../framework/ui/unitable/index';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniModalService, ConfirmActions} from '../../../../framework/uniModal/barrel';
import {IToolbarConfig, IAutoCompleteConfig, IShareAction} from './../../common/toolbar/toolbar';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {LedgerAccountReconciliation} from '../../common/reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {exportToFile, arrayToCsv} from '../../common/utils/utils';
import {Observable} from 'rxjs/Observable';
import {
    Customer,
    Supplier,
    Account,
    StatusCodeJournalEntryLine,
    LocalDate
} from '../../../unientities';
import {
    ErrorService,
    AccountService,
    StatisticsService,
    JournalEntryLineService
} from '../../../services/services';

interface IFilter {
    name: string;
    label: string;
    isSelected?: boolean;
    count?: number;
    showStatus?: boolean;
    passiveCounter?: boolean;
    hotCounter?: boolean;
}

@Component({
    selector: 'postpost',
    templateUrl: './postpost.html'
})
export class PostPost {
    @ViewChild(UniTable)
    private table: UniTable;

    @ViewChild(LedgerAccountReconciliation)
    public postpost: LedgerAccountReconciliation;

    @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.keyCode === 65) {
            event.preventDefault();
            this.autoMark();
        }
      }

    // Save
    private shareActions: IShareAction[];
    private saveActions: IUniSaveAction[];

    // Filter
    private datefield: UniFieldLayout = new UniFieldLayout();

    private registers: any[] = [
        {Register: 'customer', _DisplayName: 'Kunde'},
        {Register: 'supplier', _DisplayName: 'Leverandør'},
        {Register: 'account', _DisplayName: 'Hovedbok'}
    ];

    private currentFilter: string = 'OPEN';
    private showoptions: Array<IFilter> = [
        { label: 'Åpne poster', name: 'OPEN', isSelected: true },
        { label: 'Lukkede poster', name: 'MARKED', isSelected: false },
        { label: 'Alle poster', name: 'ALL', isSelected: false }
    ];

    // List table
    public accounts$: BehaviorSubject<any> = new BehaviorSubject(null);
    public accountsTableConfig: UniTableConfig;

    // Detail view
    public pointInTime$: BehaviorSubject<LocalDate> = new BehaviorSubject(null);
    public customer$: BehaviorSubject<Customer> = new BehaviorSubject(null);
    public supplier$: BehaviorSubject<Supplier> = new BehaviorSubject(null);
    public account$: BehaviorSubject<Account> = new BehaviorSubject(null);

    private toolbarconfig: IToolbarConfig;
    public accountSearch: IAutoCompleteConfig;
    private registerConfig: any;
    private register: string = 'customer';
    private selectedIndex: number = 0;
    private autolocking: boolean = true;
    private canceled: boolean = false;
    private allSelectedLocked: boolean = false;

    constructor(
        private tabService: TabService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private accountService: AccountService,
        private statisticsService: StatisticsService,
        private journalEntryLineService: JournalEntryLineService
    ) {
        this.setupFilter();
        this.setupAccountsTable();
        this.setupShareActions();
        this.setupSaveActions();
        this.setupToolbarConfig();
        this.setupRegisterConfig();
        this.setTabTitle();
        this.loadCustomers();
    }

    public ngOnInit() {
        this.accounts$.subscribe(() => {
            this.selectedIndex = 0;
            this.focusRow();
        });
    }

    public canDeactivate(): Observable<boolean> {
        if (!this.postpost.isDirty || this.canceled) {
            return Observable.of(true);
        }

        return this.modalService
            .openUnsavedChangesModal()
            .onClose
            .map(result => {
                if (result === ConfirmActions.ACCEPT) {
                    this.postpost.reconciliateJournalEntries();
                } else if (result === ConfirmActions.REJECT) {
                    this.postpost.abortMarking(false, false);
                }

                return result !== ConfirmActions.CANCEL;
            });
    }

    public focusRow(index?: number) {
        if (this.table) {
            this.table.focusRow(index === undefined ? this.selectedIndex : index);
        }
    }

    // Share actions
    private setupShareActions() {
        this.shareActions = [
            {
                action: () => this.exportAccounts(),
                disabled: () => false,
                label: 'Eksport kontoliste'
            }, {
                action: () => this.exportOpenPosts(),
                disabled: () => false,
                label: 'Eksport åpne poster'
            }, {
                action: () => this.exportAllOpenPosts(),
                disabled: () => false,
                label: 'Eksport alle åpne poster'
            }
        ];
    }

    // Save actions

    private setupSaveActions() {
        this.saveActions = [
            {
                action: this.save.bind(this),
                disabled: false,
                label: 'Lagre',
                main: this.autolocking && this.currentFilter !== 'MARKED' && !this.allSelectedLocked
            }, {
                action: this.lock.bind(this),
                disabled: false,
                label: 'Lukk valgte',
                main: !this.autolocking && this.currentFilter !== 'MARKED' && !this.allSelectedLocked
            }, {
                action: this.unlock.bind(this),
                disabled: false,
                label: 'Gjenåpne valgte',
                main: this.currentFilter === 'MARKED' || this.allSelectedLocked
            }, {
                action: this.automark.bind(this),
                disabled: false,
                label: 'Automerk'
            }, {
                action: this.cancel.bind(this),
                disabled: false,
                label: 'Angre'
            }, {
                action: this.autolock.bind(this),
                disabled: false,
                label: this.autolocking ? 'Deaktiver autolukking' : 'Aktiver autolukking'
            }
        ];
    }

    public autoMark() {
        if (this.postpost.canAutoMark) {
            this.automark(msg => {});
        }
    }

    private autolock(done: (message: string) => void) {
        this.autolocking = !this.autolocking;
        this.setupSaveActions();
        done(this.autolocking ? 'Automatisk lukking på' : 'Automatisk lukking av');
    }

    private save(done: (message: string) => void) {
        this.postpost.reconciliateJournalEntries();
        done('Lagret');
    }

    private automark(done: (message: string) => void) {
        this.postpost.autoMarkJournalEntries();
        done('Merket');
    }

    private lock(done: (message: string) => void) {
        this.postpost.markCheckedJournalEntries();
        done('Lukket');
    }

    private unlock(done: (message: string) => void) {
        this.postpost.unlockJournalEntries();
        done('Gjenåpnet');
    }

    private cancel(done: (message: string) => void) {
        this.postpost.abortMarking();
        done('Angret');
    }

    private exportAccounts(): Observable<any> {
        return Observable.of(this.accounts$.getValue()).map((accounts) => {
            const list = [];
            accounts.forEach((account) => {
                const row = {
                    AccountNumber: account.AccountNumber,
                    AccountName: account.AccountName,
                    SumAmount: account.SumAmount.toFixed(2)
                };
                list.push(row);
            });

            exportToFile(arrayToCsv(list), `OpenPostAccounts.csv`);
        });
    }

    private exportOpenPosts(): Observable<any> {
        return Observable.of(true).map(() => {
            this.postpost.export();
        });
    }

    private exportAllOpenPosts(): Observable<any> {
        return Observable.of(true).map(() => {
            this.postpost.exportAll(this.register);
        });
    }

    private setupFilter() {
        this.datefield.Property = 'PointInTime';
        this.datefield.Placeholder = 'Til og med dato';
    }

    private setupToolbarConfig() {
        this.toolbarconfig = {
            navigation: {
                prev: this.previousAccount.bind(this),
                next: this.nextAccount.bind(this)
            },
            contextmenu: []
        };
    }

    private setupRegisterConfig() {
        this.registerConfig = {
            items: this.registers,
            selectedItem: this.registers.find(x => x.Register === this.register),
            placeholder: 'Register'
        };
    }

    private setTabTitle() {
        this.tabService.addTab({
            url: '/accounting/postpost',
            name: 'Åpne poster',
            active: true,
            moduleID: UniModules.PostPost
        });
    }

    public nextAccount() {
        const accounts = this.accounts$.getValue();
        if (this.selectedIndex >= accounts.length - 1) {
            this.selectedIndex = accounts.length - 1;
            this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere kontoer etter denne');
        } else {
            this.selectedIndex++;
            this.focusRow();
        }
    }

    public previousAccount() {
        if (this.selectedIndex <= 0) {
            this.selectedIndex = 0;
            this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere kontoer før denne');
        } else {
            this.selectedIndex--;
            this.focusRow();
        }
    }

    public onRowSelected(event) {
        if (this.canceled) {
            this.canceled = false;
            return;
        }

        this.canDeactivate().subscribe(allowed => {
            this.canceled = false;

            if (allowed) {
                const account = event.rowModel;
                this.selectedIndex = account._originalIndex;
                switch (this.register) {
                    case 'customer':
                        this.customer$.next(account);
                        break;
                    case 'supplier':
                        this.supplier$.next(account);
                        break;
                    case 'account':
                        this.account$.next(account);
                        break;
                }
            } else {
                this.canceled = true;
                this.focusRow();
            }
        });
    }

    public onPointInTimeChanged(model) {
        this.pointInTime$.next(model.PointInTime.currentValue);
        this.reloadRegister();
    }

    public onFilterClick(filter: IFilter, searchFilter?: string) {
        this.showoptions.forEach(f => f.isSelected = f === filter);
        this.postpost.showHideEntries(filter.name);
        this.currentFilter = filter.name;
        this.setupSaveActions();
        this.reloadRegister();
    }

    public onAllSelectedLocked(allLocked) {
        this.allSelectedLocked = allLocked;
        this.setupSaveActions();
    }

    private getDateFilter(): string {
        const date = this.pointInTime$.getValue();
        return date ? `and FinancialDate le '${date}'` : '';
    }

    private getStatusFilter(): string {
        switch (this.currentFilter) {
            case 'OPEN':
                return ` and (StatusCode eq ${StatusCodeJournalEntryLine.Open} `
                    + `or StatusCode eq ${StatusCodeJournalEntryLine.PartlyMarked})`;
            case 'MARKED':
                return ` and StatusCode eq ${StatusCodeJournalEntryLine.Marked}`;
        }

        return '';
    }

    private loadCustomers() {
        this.statisticsService
            .GetAllUnwrapped(`model=JournalEntryLine&` +
                             `select=Customer.ID as ID,Customer.CustomerNumber as AccountNumber,` +
                             `Info.Name as AccountName,sum(RestAmount) as SumAmount&` +
                             `expand=SubAccount,SubAccount.Customer,SubAccount.Customer.Info&` +
                             `filter=SubAccount.CustomerID gt 0 ${this.getStatusFilter()} ${this.getDateFilter()}&` +
                             `orderby=Customer.CustomerNumber`)
            .subscribe(accounts => {
                this.accounts$.next(accounts);
            });
    }

    private loadSuppliers() {
        this.statisticsService
            .GetAllUnwrapped(`model=JournalEntryLine&` +
                             `select=Supplier.ID as ID,Supplier.SupplierNumber as AccountNumber,` +
                             `Info.Name as AccountName,sum(RestAmount) as SumAmount&` +
                             `expand=SubAccount,SubAccount.Supplier,SubAccount.Supplier.Info&` +
                             `filter=SubAccount.SupplierID gt 0 ${this.getStatusFilter()} ${this.getDateFilter()}&` +
                             `orderby=Supplier.SupplierNumber`)
            .subscribe(accounts => {
                this.accounts$.next(accounts);
            });
    }

    private loadAccounts() {
        this.statisticsService
            .GetAllUnwrapped(`model=JournalEntryLine&` +
                             `select=Account.ID as ID,Account.AccountNumber as AccountNumber,` +
                             `Account.AccountName as AccountName,sum(RestAmount) as SumAmount&` +
                             `expand=Account&` +
                             `filter=Account.UsePostPost eq 1 and Account.AccountGroupID gt 0 ${this.getStatusFilter()}` +
                             ` ${this.getDateFilter()}&` +
                             `orderby=Account.AccountNumber`)
            .subscribe(accounts => {
                this.accounts$.next(accounts);
            });
    }

    private reloadRegister() {
        switch (this.register) {
            case 'customer':
                this.loadCustomers();
                break;
            case 'supplier':
                this.loadSuppliers();
                break;
            case 'account':
                this.loadAccounts();
                break;
        }
    }

    public changeRegister(register) {
            this.register = register;
            switch (this.register) {
                case 'customer':
                    this.supplier$.next(null);
                    this.account$.next(null);
                    this.loadCustomers();
                    break;
                case 'supplier':
                    this.customer$.next(null);
                    this.account$.next(null);
                    this.loadSuppliers();
                    break;
                case 'account':
                    this.customer$.next(null);
                    this.supplier$.next(null);
                    this.loadAccounts();
                    break;
            }
    }

    public onFiltersChange(filter) {
        setTimeout(() => {
            if (filter !== '') {
                const row = this.table.getTableData()[0];
                if (this.table.getRowCount() === 1 && row._originalIndex !== this.selectedIndex) {
                    this.selectedIndex = row._originalIndex;
                    this.table.focusRow(this.selectedIndex);
                }
            }
        });
    }

    private setupAccountsTable() {
        const accountCol = new UniTableColumn('AccountNumber', 'Konto', UniTableColumnType.Text)
        .setWidth('1.5rem')
        .setLinkResolver(row => {
            switch (this.register) {
                case 'customer':
                    return `/sales/customer/${row.ID}`;
                case 'supplier':
                    return `/accounting/suppliers/${row.ID}`;
            }
        });
        const nameCol = new UniTableColumn('AccountName', 'Navn', UniTableColumnType.Text).setWidth('5em');
        const sumCol = new UniTableColumn('SumAmount', 'Sum åpne poster', UniTableColumnType.Money).setWidth('2.5em');
        this.accountsTableConfig = new UniTableConfig('accounting.postpost', false, true, 10)
            .setSearchable(true)
            .setColumnMenuVisible(false)
            .setMultiRowSelect(false)
            .setAutoAddNewRow(false)
            .setColumns([accountCol, nameCol, sumCol]);
    }
}
