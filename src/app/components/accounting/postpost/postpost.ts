import {ViewChild, Component} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniFieldLayout, FieldType} from '../../../../framework/ui/uniform/index';
import {UniTableColumn, UniTableColumnType, UniTableConfig, UniTable} from '../../../../framework/ui/unitable/index';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniModalService, ConfirmActions} from '../../../../framework/uniModal/barrel';
import {IToolbarConfig, IAutoCompleteConfig} from './../../common/toolbar/toolbar';
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
    private postpost: LedgerAccountReconciliation

    //Save
    private saveActions: IUniSaveAction[];

    //Filter
    private datefield: UniFieldLayout = new UniFieldLayout();

    private registers = [
        {Register: 'customer', _DisplayName: 'Kunde'},
        {Register: 'supplier', _DisplayName: 'Leverandør'},
        {Register: 'account', _DisplayName: 'Hovedbok'}
    ];

    private showoptions: Array<IFilter> = [
        { label: 'Åpne poster', name: 'OPEN', isSelected: true },
        { label: 'Lukkede poster', name: 'MARKED', isSelected: false },
        { label: 'Alle poster', name: 'ALL', isSelected: false }
    ];

    //List table
    public accounts$: BehaviorSubject<any> = new BehaviorSubject(null);
    public accountsTableConfig: UniTableConfig;

    //Detail view
    public pointInTime$: BehaviorSubject<LocalDate> = new BehaviorSubject(new LocalDate());
    public customer$: BehaviorSubject<Customer> = new BehaviorSubject(null);
    public supplier$: BehaviorSubject<Supplier> = new BehaviorSubject(null);
    public account$: BehaviorSubject<Account> = new BehaviorSubject(null);

    private toolbarconfig: IToolbarConfig;
    private accountSearch: IAutoCompleteConfig;
    private registerConfig: any;
    private register: string = 'customer';
    private selectedIndex: number = 0;
    private autolocking: boolean = true;
    private canceled: boolean = false;

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
                    this.postpost.isDirty = false;
                }

                return result !== ConfirmActions.CANCEL;
            });
    }

    public focusRow(index = undefined) {
        if (this.table) {
            this.table.focusRow(index === undefined ? this.selectedIndex : index);
        }
    }

    //Save actions

    private setupSaveActions() {
        this.saveActions =
            [{
            action: this.save.bind(this),
            disabled: false,
            label: 'Lagre',
            main: this.autolocking
        },{
            action: this.lock.bind(this),
            disabled: false,
            label: 'Lås',
            main: !this.autolocking
        },{
            action: this.unlock.bind(this),
            disabled: false,
            label: 'Lås opp'
        },{
            action: this.automark.bind(this),
            disabled: false,
            label: 'Automerk'
        },{
            action: this.cancel.bind(this),
            disabled: false,
            label: 'Angre'
        },{
            action: this.exportAccounts.bind(this),
            disabled: false,
            label: 'Eksport kontoliste'
        },{
            action: this.exportOpenPosts.bind(this),
            disabled: false,
            label: 'Eksport åpne poster'
        },{
            action: this.autolock.bind(this),
            disabled: false,
            label: this.autolocking ? 'Deaktiver auto lås' : 'Aktiver auto lås'
        }];
    }

    private autolock(done: (message: string) => void) {
        this.autolocking = !this.autolocking;
        this.setupSaveActions();
        done(this.autolocking ? 'Automatisk låsing på' : 'Automatisk låsing av');
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
        done('Låst');
    }

    private unlock(done: (message: string) => void) {
        this.postpost.unlockJournalEntries();
        done('Opplåst');
    }

    private cancel(done: (message: string) => void) {
        this.postpost.abortMarking();
        done('Angret');
    }

    private exportAccounts(done: (message: string) => void) {
        let accounts = this.accounts$.getValue();

        var list = [];
        accounts.forEach((account) => {
            var row = {
                AccountNumber: account.AccountNumber,
                AccountName: account.AccountName,
                SumAmount: account.SumAmount.toFixed(2)
            };
            list.push(row);
        });

        exportToFile(arrayToCsv(list), `OpenPostAccounts.csv`);
        done('Fil eksportert');
    }

    private exportOpenPosts(done: (message: string) => void) {
        this.postpost.export();

        done('Fil eksportert');
    }

    //

    private setupFilter() {
        this.datefield.Property = 'PointInTime';
        this.datefield.Placeholder = 'Til og med dato';
    }

    private setupToolbarConfig() {
        let r = this.registers.find(x => x.Register == this.register);
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
            selectedItem: this.registers.find(x => x.Register == this.register),
            placeholder: 'Register'
        }
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
        let accounts = this.accounts$.getValue();
        if (this.selectedIndex >= accounts.length - 1) {
            this.selectedIndex = accounts.length - 1;
            this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere kontoer etter denne');
        } else {
            this.selectedIndex++;
            this.focusRow();
        }
    }

    public previousAccount() {
        let accounts = this.accounts$.getValue();
        if (this.selectedIndex <= 0) {
            this.selectedIndex = 0;
            this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere kontoer før denne');
        } else {
            this.selectedIndex--;
            this.focusRow();
        }
    }

    private onRowSelected(event) {
        if (this.canceled) { 
            this.canceled = false; 
            return; 
        }
        
        this.canDeactivate().subscribe(allowed => {
            this.canceled = false;

            if (allowed) {
                let account = event.rowModel;
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

    private onPointInTimeChanged(model) {
        this.pointInTime$.next(model.PointInTime.currentValue);
    }

    private onFilterClick(filter: IFilter, searchFilter?: string) {
        this.showoptions.forEach(f => f.isSelected = f == filter);
        this.postpost.showHideEntries(filter.name);
    }

    private getDateFilter(): string {
        let date = this.pointInTime$.getValue();
        return date ? `and FinancialDate le '${date}'` : '';
    }

    private loadCustomers() {
        this.statisticsService
            .GetAllUnwrapped(`model=JournalEntryLine&` +
                             `select=Customer.ID as ID,Customer.CustomerNumber as AccountNumber,Info.Name as AccountName,sum(Amount) as SumAmount&` +
                             `expand=SubAccount,SubAccount.Customer,SubAccount.Customer.Info&` +
                             `filter=SubAccount.CustomerID gt 0 and (StatusCode eq ${StatusCodeJournalEntryLine.Open} or StatusCode eq ${StatusCodeJournalEntryLine.PartlyMarked}) ${this.getDateFilter()}&` +
                             `orderby=Customer.CustomerNumber`)
            .subscribe(accounts => {
                this.accounts$.next(accounts);
            });
    }

    private loadSuppliers() {
        this.statisticsService
            .GetAllUnwrapped(`model=JournalEntryLine&` +
                             `select=Supplier.ID as ID,Supplier.SupplierNumber as AccountNumber,Info.Name as AccountName,sum(Amount) as SumAmount&` +
                             `expand=SubAccount,SubAccount.Supplier,SubAccount.Supplier.Info&` +
                             `filter=SubAccount.SupplierID gt 0 and (StatusCode eq ${StatusCodeJournalEntryLine.Open} or StatusCode eq ${StatusCodeJournalEntryLine.PartlyMarked}) ${this.getDateFilter()}&` +
                             `orderby=Supplier.SupplierNumber`)
            .subscribe(accounts => {
                this.accounts$.next(accounts);
            });
    }

    private loadAccounts() {
        this.statisticsService
            .GetAllUnwrapped(`model=JournalEntryLine&` +
                             `select=Account.ID as ID,Account.AccountNumber as AccountNumber,Account.AccountName as AccountName,sum(Amount) as SumAmount&` +
                             `expand=Account&` +
                             `filter=Account.UsePostPost eq 1 and (StatusCode eq ${StatusCodeJournalEntryLine.Open} or StatusCode eq ${StatusCodeJournalEntryLine.PartlyMarked}) ${this.getDateFilter()}&` +
                             `orderby=Account.AccountNumber`)
            .subscribe(accounts => {
                this.accounts$.next(accounts);
            });
    }

    private changeRegister(register) {
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

    private setupAccountsTable() {
        let accountCol = new UniTableColumn('AccountNumber', 'Konto', UniTableColumnType.Text)
            .setWidth('1.5rem')
            .setTemplate((account) => {
                switch (this.register) {
                    case 'customer':
                        return `<a href='/#/sales/customer/${account.ID}'>${account.AccountNumber}</a>`;
                    case 'supplier':
                        return `<a href='/#/suppliers/${account.ID}'>${account.AccountNumber}</a>`;
                }
                return account.AccountNumber;
            });

        let nameCol = new UniTableColumn('AccountName', 'Navn', UniTableColumnType.Text).setWidth('5em');
        let sumCol = new UniTableColumn('SumAmount', 'Sum åpne poster', UniTableColumnType.Money)
            .setWidth('2.5em');

        this.accountsTableConfig = new UniTableConfig(false, true, 10)
            .setSearchable(true)
            .setColumnMenuVisible(false)
            .setMultiRowSelect(false)
            .setAutoAddNewRow(false)
            .setColumns([accountCol, nameCol, sumCol]);
    }
}
