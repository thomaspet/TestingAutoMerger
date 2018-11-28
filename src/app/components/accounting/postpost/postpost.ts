import {ViewChild, Component, HostListener} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {IToolbarConfig, IAutoCompleteConfig, IShareAction} from './../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';
import {LedgerAccountReconciliation, LedgerTableEmitValues} from '../../common/reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {exportToFile, arrayToCsv} from '../../common/utils/utils';
import {Observable} from 'rxjs';
import {UniAutomarkModal} from '../../common/reconciliation/ledgeraccounts/uniAutomarkModal';
import {Customer, Supplier, Account, StatusCodeJournalEntryLine} from '../../../unientities';
import {StatisticsService, NumberFormat} from '../../../services/services';
import { IUniTab } from '@app/components/layout/uniTabs/uniTabs';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
    selector: 'postpost',
    templateUrl: './postpost.html'
})
export class PostPost {

    @ViewChild(LedgerAccountReconciliation)
    public postpost: LedgerAccountReconciliation;

    shareActions: IShareAction[];
    saveActions: IUniSaveAction[];
    registers: any[] = [
        {Register: 'customer', _DisplayName: 'Kunde'},
        {Register: 'supplier', _DisplayName: 'Leverandør'},
        {Register: 'account', _DisplayName: 'Hovedbok'}
    ];

    currentFilter: string = 'OPEN';
    tabs: IUniTab[] = [
        {name: 'Åpne poster', value: 'OPEN'},
        {name: 'Lukkede poster', value: 'MARKED'},
        {
            name: 'Alle poster',
            value: 'ALL',
            tooltip: 'Om du skal lukke poster, velg Apne poster-fanen.'
        }
    ];

    accountListfilters = [
        { name: 'Kontonummer', value: 'AccountNumber' },
        { name: 'Navn', value: 'AccountName' },
        { name: 'Sum åpne poster', value: 'SumAmount' },
        { name: 'Antall poster', value: 'count' }
    ];

    currentListFilter = this.accountListfilters[0];

    mainTabs: IUniTab[] = [];
    currentTab: IUniTab;
    accountSearchFilterString: string = '';
    searchControl: FormControl = new FormControl('');
    scrollbar: PerfectScrollbar;
    activeAccount: number = 0;
    customer$: BehaviorSubject<Customer> = new BehaviorSubject(null);
    supplier$: BehaviorSubject<Supplier> = new BehaviorSubject(null);
    account$: BehaviorSubject<Account> = new BehaviorSubject(null);
    current$: BehaviorSubject<any> = new BehaviorSubject(null);
    accounts = [];
    filteredAccounts = [];

    toolbarconfig: IToolbarConfig;
    accountSearch: IAutoCompleteConfig;
    registerConfig: any;
    autolocking: boolean = true;
    private canceled: boolean = false;
    private ledgerEmitValue: LedgerTableEmitValues = LedgerTableEmitValues.InitialValue;
    private register: string = 'customer';

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.keyCode === 77) {
            event.preventDefault();
            this.autoMark();
        }
    }

    constructor(
        private tabService: TabService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService,
        private route: ActivatedRoute,
        private router: Router,
        public numberFormatService: NumberFormat
    ) {

        this.tabService.addTab({
            url: '/accounting/postpost',
            name: 'Åpne poster',
            active: true,
            moduleID: UniModules.PostPost
        });

        this.route.queryParams.subscribe((params) => {

            const mode = params['mode'];
            let toolbarModeString = 'Kunder';

            this.accountSearchFilterString = params['name'] || '';

            if (mode && mode !== 'kunder') {
                this.register = mode === 'kontoer' ? 'account' : 'supplier';
                toolbarModeString = mode === 'kontoer' ? 'Leverandører' : 'Hovedbok';
            }

            this.setMainTabs(mode || 'kunder');
            this.checkForDiff();
            this.setupShareActions();
            this.setupToolbarConfig(toolbarModeString);
            this.setupRegisterConfig();
            this.reloadRegister();
            this.setupSaveActions();
        });
    }

    public ngOnInit() {
        this.searchControl.valueChanges
            .debounceTime(150)
            .subscribe(query => {
                this.filteredAccounts = this.getFilteredAccounts();
                setTimeout(() => {
                    this.scrollbar.update();
                });
            });
    }

    public ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar('#role-info');
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

    private setMainTabs(name: string, hidden: boolean = true) {
        this.mainTabs = [
            {name: 'Alle ' +  name, value: 'ALL'},
            {
                name: `${(name.substr(0, 1).toUpperCase()) + (name.substr(1, name.length - 1))} med differanse`,
                value: 'DIFF',
                hidden: hidden,
                tooltip: 'Kunder som har differanse mellom åpne poster og saldo på konto i regnskapet. Sjekk åpne poster'
            }
        ];
        if (!this.currentTab) {
            this.currentTab = this.mainTabs[0];
        }
    }

    public goToAccount(event, id: number) {
        event.stopPropagation();
        switch (this.register) {
            case 'customer':
                this.router.navigateByUrl(`/sales/customer/${id}`);
                break;
            case 'supplier':
                this.router.navigateByUrl(`/accounting/suppliers/${id}`);
                break;
            case 'account':
                this.router.navigateByUrl(`/accounting/accountsettings`);
                break;
        }
    }

    public onActiveFilterChange(filter) {
        const reverseMultiplier = filter.value === this.currentListFilter.value ? -1 : 1;
        this.currentListFilter = filter;
        this.filteredAccounts = this.filteredAccounts.sort(this.compare(filter.value, reverseMultiplier));
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
                disabled: this.currentFilter !== 'OPEN',
                label: 'Lagre',
                main: this.autolocking && this.ledgerEmitValue === LedgerTableEmitValues.MarkedPosts
            }, {
                action: this.unlock.bind(this),
                disabled: false,
                label: 'Gjenåpne valgte',
                main: this.ledgerEmitValue === LedgerTableEmitValues.MarkedLocked,
            }, {
                action: this.autoMark.bind(this),
                disabled: !(this.postpost && this.postpost.canAutoMark),
                label: 'Automerk denne konto',
                main: this.ledgerEmitValue === LedgerTableEmitValues.InitialValue && (this.postpost && this.postpost.canAutoMark),
            }, {
                action: this.autoMarkAll.bind(this),
                disabled: false,
                label: 'Automerk alle kontoer'
            }, {
                action: this.cancel.bind(this),
                disabled: false,
                label: 'Fjern alle markeringer'
            }, {
                action: this.autolock.bind(this),
                disabled: false,
                label: this.autolocking ? 'Deaktiver autolukking' : 'Aktiver autolukking'
            }
        ];
    }

    private autolock(done: (message: string) => void) {
        this.autolocking = !this.autolocking;
        this.setupSaveActions();
        done(this.autolocking ? 'Automatisk lukking på' : 'Automatisk lukking av');
    }

    private save(done: (message: string) => void) {
        this.postpost.reconciliateJournalEntries(done);
    }

    public autoMark(done: (message: string) => void = msg => {}) {
        this.modalService.open(UniAutomarkModal, {}).onClose.subscribe((automark) => {
            if (this.postpost.canAutoMark && automark) {
                this.postpost.autoMarkJournalEntries(automark, done);
            } else {
                done('Automerking avbrutt');
            }
        });
    }

    public autoMarkAll(done: (message: string) => void = msg => {}) {
        this.modalService.open(UniAutomarkModal, {
            data: {
                all: true,
                ctrl: this.postpost
            }, hideCloseButton: true }).onClose.subscribe((response) => {
            if (response) {
                done(response.doneMessage || 'Automerking ferdig');
            } else {
                done('Automerking avbrutt');
            }

            this.reloadRegister();
        });
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
        return Observable.of(this.accounts).map((accounts) => {
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

    private getFilteredAccounts() {
        return this.accounts.filter((account: any) => {
            if (account.AccountName.toLowerCase().includes(this.accountSearchFilterString.toLowerCase())
                || account.AccountNumber.toString().includes(this.accountSearchFilterString.toLowerCase())) {
                return account;
            }
        }).slice(0, 100);
    }

    private compare(propName, rev) {
        return (a, b) => a[propName] === b[propName] ? 0 : a[propName] < b[propName] ? (-1 * rev) : (1 * rev);
    }

    private setupToolbarConfig(register: string = '') {
        this.toolbarconfig = {
            title: 'Åpne poster - ' + register,
            contextmenu: [],
        };
    }

    private setupRegisterConfig() {
        this.registerConfig = {
            items: this.registers,
            selectedItem: this.registers.find(x => x.Register === this.register),
            placeholder: 'Register'
        };
    }

    public onRowSelected(event) {
        if (this.canceled) {
            this.canceled = false;
            return;
        }

        this.canDeactivate().subscribe(allowed => {
            this.canceled = false;

            if (allowed) {
                this.activeAccount = event.ID;
                const account = event;
                this.current$.next(account);
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
            }
        });
    }

    public onFilterClick(tab: IUniTab) {
        this.postpost.showHideEntries(tab.value);
        this.currentFilter = tab.value;
        this.setupSaveActions();
    }

    public onCustomerFilterClick(tab: IUniTab) {
        this.currentTab = tab;
        this.reloadRegister();
    }

    public onLedgerTableSelectionChanged(value) {
        this.ledgerEmitValue = value;
        this.setupSaveActions();
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

    private checkForDiff() {
         if (this.register === 'account') {
            this.setMainTabs('kontoer', true);
        } else {
            this.statisticsService.GetAll(
                'model=journalentryline&select=Account.AccountNumber as AccountNumber,Account.AccountName as AccountName,' +
                'SubAccount.AccountNumber,SubAccount.AccountName,sum(Amount) as Sum,count(ID) as count,' +
                'sum(casewhen(statuscode eq 31004\,0\,RestAmount)) as RestAmount' +
                `&filter=SubAccountid gt 0 and statuscode le 31003 and subaccount.${this.register}id gt 0&top=` +
                '&having=sum(amount) ne sum(restamount)&expand=account,subaccount').subscribe((res) => {
                    this.setMainTabs((this.register === 'customer' ? 'kunder' : 'leverandører'),
                    !(res && res.Data && res.Data.length));
                }) ;
        }
    }

    private loadCustomers() {
        const query = this.currentTab.value !== 'DIFF'
            ? `model=JournalEntryLine&` +
                `select=Customer.ID as ID,Customer.CustomerNumber as AccountNumber,` +
                `Info.Name as AccountName,sum(RestAmount) as SumAmount,count(ID) as count&` +
                `expand=SubAccount,SubAccount.Customer,SubAccount.Customer.Info&` +
                `filter=SubAccount.CustomerID gt ` +
                `0 ${this.getStatusFilter()}` +
                `&orderby=Customer.CustomerNumber`
            : 'model=JournalEntryLine&' +
                `select=Customer.ID as ID,Customer.CustomerNumber as AccountNumber,count(ID) as count,` +
                `Info.Name as AccountName,sum(casewhen(statuscode eq 31004\,0\,RestAmount)) as SumAmount,sum(Amount) as Balance&` +
                'expand=SubAccount,SubAccount.Customer,SubAccount.Customer.Info&' +
                `filter=SubAccountid gt 0 and subaccount.customerid gt 0&` +
                'having=sum(amount) ne sum(casewhen(statuscode eq 31004\,0\,RestAmount))' +
                '&expand=account,subaccount&orderby=Customer.CustomerNumber';
        this.statisticsService.GetAllUnwrapped(query)
            .subscribe(accounts => {
                this.accounts = accounts;
                this.filteredAccounts = this.getFilteredAccounts();
                if (this.filteredAccounts.length) {
                    this.onRowSelected(this.filteredAccounts[0]);
                }
                this.scrollbar.update();
            });
    }

    private loadSuppliers() {
        const query = this.currentTab.value !== 'DIFF'
            ? `model=JournalEntryLine&` +
                `select=Supplier.ID as ID,Supplier.SupplierNumber as AccountNumber,` +
                `Info.Name as AccountName,sum(RestAmount) as SumAmount,count(ID) as count&` +
                `expand=SubAccount,SubAccount.Supplier,SubAccount.Supplier.Info&` +
                `filter=SubAccount.SupplierID gt 0 ${this.getStatusFilter()}` +
                `&orderby=Supplier.SupplierNumber`
            :   `model=JournalEntryLine&` +
                `select=Supplier.ID as ID,Supplier.SupplierNumber as AccountNumber,count(ID) as count,` +
                `Info.Name as AccountName,sum(casewhen(statuscode eq 31004\,0\,RestAmount)) as SumAmount,sum(Amount) as Balance&` +
                `expand=SubAccount,SubAccount.Supplier,SubAccount.Supplier.Info&` +
                `filter=SubAccountid gt 0 and subaccount.supplierid gt 0&` +
                'having=sum(amount) ne sum(casewhen(statuscode eq 31004\,0\,RestAmount))' +
                '&expand=account,subaccount&orderby=Supplier.SupplierNumber';
        this.statisticsService.GetAllUnwrapped(query)
            .subscribe(accounts => {
                this.accounts = accounts;
                this.filteredAccounts = this.getFilteredAccounts();
                if (this.filteredAccounts.length) {
                    this.onRowSelected(this.filteredAccounts[0]);
                }
                this.scrollbar.update();
            });
    }

    private loadAccounts() {
        this.statisticsService
            .GetAllUnwrapped(`model=JournalEntryLine&` +
                             `select=Account.ID as ID,Account.AccountNumber as AccountNumber,count(ID) as count,` +
                             `Account.AccountName as AccountName,sum(RestAmount) as SumAmount&` +
                             `expand=Account&` +
                             `filter=Account.UsePostPost eq 1 and Account.AccountGroupID gt 0 ${this.getStatusFilter()}` +
                             `&` +
                             `orderby=Account.AccountNumber`)
            .subscribe(accounts => {
                this.accounts = accounts;
                this.filteredAccounts = this.getFilteredAccounts();
                if (this.filteredAccounts.length) {
                    this.onRowSelected(this.filteredAccounts[0]);
                }
                this.scrollbar.update();
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
                    this.setupToolbarConfig('Kunder');
                    this.supplier$.next(null);
                    this.account$.next(null);
                    this.loadCustomers();
                    break;
                case 'supplier':
                    this.setupToolbarConfig('Leverandører');
                    this.customer$.next(null);
                    this.account$.next(null);
                    this.loadSuppliers();
                    break;
                case 'account':
                this.setupToolbarConfig('Hovedbok');
                    this.customer$.next(null);
                    this.supplier$.next(null);
                    this.loadAccounts();
                    break;
            }
            this.checkForDiff();
    }
}
