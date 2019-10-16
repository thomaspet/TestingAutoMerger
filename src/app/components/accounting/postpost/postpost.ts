import {ViewChild, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {IToolbarConfig, IAutoCompleteConfig} from './../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';
import {LedgerAccountReconciliation, LedgerTableEmitValues} from '../../common/reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {exportToFile, arrayToCsv} from '../../common/utils/utils';
import {Observable} from 'rxjs';
import {UniAutomarkModal} from '../../common/reconciliation/ledgeraccounts/uniAutomarkModal';
import {Customer, Supplier, Account, StatusCodeJournalEntryLine} from '../../../unientities';
import {StatisticsService, NumberFormat, PageStateService} from '../../../services/services';
import { IUniTab } from '@app/components/layout/uni-tabs';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
    selector: 'postpost',
    templateUrl: './postpost.html',
    host: {
        '(document:keydown)': 'checkForSaveKey($event)'
    }
})
export class PostPost {

    @ViewChild(LedgerAccountReconciliation)
    public postpost: LedgerAccountReconciliation;

    saveActions: IUniSaveAction[];
    registers: any[] = [
        {Register: 'customer', _DisplayName: 'Kunde'},
        {Register: 'supplier', _DisplayName: 'Leverandør'},
        {Register: 'account', _DisplayName: 'Hovedbok'}
    ];

    currentFilter: string = 'OPEN';

    activeIndex: number = 0;
    tabs: IUniTab[] = [
        {
            name: 'Åpne poster',
            value: 'OPEN',
            tooltip: 'Ctrl + A for å automerke, Ctrl + M for å fjerne alle markeringer'
        },
        {name: 'Lukkede poster', value: 'MARKED'},
        {
            name: 'Alle poster',
            value: 'ALL',
            tooltip: 'Om du skal lukke poster, velg Åpne poster-fanen.'
        }
    ];

    mainTabs: IUniTab[] = [
        {name: 'Alle', value: 'EVERY', disabled: false},
        {name: 'ACCOUNTING.POSTPOST.ALL_WITH_OPEN', value: 'ALL', disabled: false},
        {
            name: `Differanser`,
            value: 'DIFF',
            disabled: true,
            tooltip: 'Differanse mellom åpne poster og saldo på konto i regnskapet. Sjekk åpne poster'
        }
    ];

    accountListfilters = [
        { name: 'Kontonummer', value: 'AccountNumber', multiplier: 1, initialMulitplier: 1 },
        { name: 'Navn', value: 'AccountName', multiplier: 1, initialMulitplier: 1 },
        { name: 'Sum poster', value: 'SumAmount', multiplier: -1, initialMulitplier: 1 },
        { name: 'Antall poster', value: 'count', multiplier: -1, initialMulitplier: 1 }
    ];

    currentListFilter = this.accountListfilters[0];
    mainActiveIndex: number = 0;
    accountSearchFilterString: string = '';
    postSearchFilterString: string = '';
    nameFromParams: string = '';
    searchControl: FormControl = new FormControl('');
    scrollbar: PerfectScrollbar;
    activeAccount: number = 0;
    activeSubAccountID: number = 0;
    selectedReskontroTypeForCleaning: string;
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
    initial: boolean = true;
    private canceled: boolean = false;
    private ledgerEmitValue: LedgerTableEmitValues = LedgerTableEmitValues.InitialValue;
    private register: string = 'customer';

    constructor(
        private tabService: TabService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService,
        private route: ActivatedRoute,
        private router: Router,
        private pageStateService: PageStateService,
        public numberFormatService: NumberFormat
    ) {
        this.route.queryParams.subscribe((params) => {
            this.initial = true;
            this.register = params['register'] || this.register;

            // Fetch values from params
            this.nameFromParams = params['name'] || '';
            this.accountSearchFilterString = params['search'] || '';
            this.postSearchFilterString = params['postsearch'] || '';
            this.activeIndex = params['tabindex'] || 0;

            if (this.activeIndex > this.tabs.length) {
                this.activeIndex = 0;
            }

            // Set current filter for posts
            this.currentFilter = this.tabs[this.activeIndex].value;

            this.checkForDiff().then((hideDiff: boolean) => {

                // Hide/show correct tabs
                this.mainTabs[2].disabled = hideDiff;
                this.mainTabs[1].disabled = this.register === 'account';
                this.mainTabs = [...this.mainTabs];

                // Wait for the tab update before settings mainTabIndex. Check that the number is not corrupt (to big)
                this.mainActiveIndex = (params['maintabindex'] < this.mainTabs.length) ? params['maintabindex'] || 0 : 0;

                this.setupToolbarConfig();
                this.setupRegisterConfig();
                this.reloadRegister();
                this.setupSaveActions();
                this.addTab();

                setTimeout(() => {
                    this.initial = false;
                }, 500);
            });
        });
    }

    ngOnDestroy() {
        this.customer$.complete();
        this.supplier$.complete();
        this.account$.complete();
        this.current$.complete();
    }

    public addTab() {
        this.pageStateService.setPageState('register', this.register);
        this.pageStateService.setPageState('name', this.nameFromParams);
        this.pageStateService.setPageState('search', this.accountSearchFilterString);
        this.pageStateService.setPageState('postsearch', this.postSearchFilterString);
        this.pageStateService.setPageState('tabindex', this.activeIndex.toString());
        this.pageStateService.setPageState('maintabindex', this.mainActiveIndex.toString());

        this.tabService.addTab({
            url: this.pageStateService.getUrl(),
            name: 'NAVBAR.OPEN_POST',
            active: true,
            moduleID: UniModules.PostPost
        });

    }

    public ngOnInit() {
        this.searchControl.valueChanges
            .debounceTime(150)
            .subscribe(query => {
                this.filteredAccounts = this.getFilteredAccounts();
                setTimeout(() => {
                    this.scrollbar.update();
                    this.addTab();
                });
            });
    }

    public postpostSearchUpdated(searchString) {
        this.postSearchFilterString = searchString;
        this.addTab();
    }

    public checkForSaveKey(event) {
        if ((event.ctrlKey || event.metaKey) && event.keyCode === 65) {
            event.preventDefault();
            this.autoMark();
        }

        if ((event.ctrlKey || event.metaKey) && event.keyCode === 77) {
            event.preventDefault();
            this.cancel(() => {}, false);
        }
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

    public goToAccount(event, id: number, number?: number) {
        event.stopPropagation();
        switch (this.register) {
            case 'customer':
                this.router.navigateByUrl(`/sales/customer/${id}`);
                break;
            case 'supplier':
                this.router.navigateByUrl(`/accounting/suppliers/${id}`);
                break;
            case 'account':
                this.router.navigateByUrl(`/accounting/accountquery?account=${number}`);
                break;
        }
    }

    public onActiveFilterChange(filter) {
        this.currentListFilter = filter;
        this.filteredAccounts = this.filteredAccounts.sort(this.compare(filter.value, filter.multiplier * filter.initialMulitplier));
        filter.initialMulitplier *= -1;
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
            }, {
                action: this.cleanAndResetLinesWithWrongStatus.bind(this),
                disabled: false,
                label: 'Resett alle linjer u/motpost'
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
        this.postpost.unlockJournalEntries(this.activeAccount);
        done('Gjenåpnet');
    }



    private cleanAndResetAllLinesWithWrongStatus(entityType: string) {
        return (done: (message: string) => void) => {
            this.modalService.confirm({
                header: 'Tilbakestille linjer',
                message: 'Vil du tilbakestille status og restbeløp på alle linjer uten motpost for alle kunder?',
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                switch (response) {
                    case ConfirmActions.ACCEPT:
                        this.postpost.ResetJournalEntrylinesPostPostStatus(this.activeSubAccountID, entityType);
                        done('Tilbakestilling ble kjørt.');
                    break;
                    default:
                        done('Avbrutt');
                    break;
                }
            });
        };
    }

    private cleanAndResetLinesWithWrongStatus (done: (message: string) => void) {

        this.modalService.confirm({
            header: 'Tilbakestille linjer',
            message: 'Vil du tilbakestille status og restbeløp på alle linjer uten motpost for alle kunder og leverandører?',
            buttonLabels: {
                accept: 'Ja',
                reject: 'Nei',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            switch (response) {
                case ConfirmActions.ACCEPT:
                    this.postpost.ResetJournalEntrylinesPostPostStatus(this.activeSubAccountID, 'customer');
                    this.postpost.ResetJournalEntrylinesPostPostStatus(this.activeSubAccountID, 'supplier');
                    done('Tilbakestilling ble kjørt.');
                break;
                default:
                    done('Avbrutt');
                break;
            }
        });

    }
    private cancel(done: (message: string) => void, ask: boolean = true) {
        this.postpost.abortMarking(ask);
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

    private getFilteredAccounts(isInit: boolean = false) {

        let index = 0;

        if (isInit && this.nameFromParams && this.accounts.length > 100) {
            index = this.accounts.findIndex(acc => acc.AccountName === this.nameFromParams);
            if ((index + 100) > this.accounts.length) {
                index = this.accounts.length - 100;
            }
        }

        // Let user search for smaller/bigger than SumAmount by starting querystring with < or > and then a number..
        if (this.accountSearchFilterString.startsWith('>')) {
            const searchString = this.accountSearchFilterString.substr(1, this.accountSearchFilterString.length);
            if (searchString.length && !isNaN(parseInt(searchString.trim(), 10))) {
                return this.accounts.filter(acc => acc.SumAmount > parseInt(searchString.trim(), 10));
            }
        } else if (this.accountSearchFilterString.startsWith('<')) {
            const searchString = this.accountSearchFilterString.substr(1, this.accountSearchFilterString.length);
            if (searchString.length && !isNaN(parseInt(searchString.trim(), 10))) {
                return this.accounts.filter(acc => acc.SumAmount < parseInt(searchString.trim(), 10));
            }
        } else if (this.accountSearchFilterString.startsWith('=')) {
            const searchString = this.accountSearchFilterString.substr(1, this.accountSearchFilterString.length);
            if (searchString.length && !isNaN(parseInt(searchString.trim(), 10))) {
                return this.accounts.filter(acc => acc.SumAmount === parseInt(searchString.trim(), 10));
            }
        }
        return this.accounts.filter((account: any) => {
            if (account.AccountName.toLowerCase().includes(this.accountSearchFilterString.toLowerCase())
                || account.AccountNumber.toString().includes(this.accountSearchFilterString.toLowerCase())) {
                return account;
            }
        }).slice(index > -1 ? index : 0, index + 100);
    }

    private compare(propName, rev) {
        return (a, b) => a[propName] === b[propName] ? 0 : a[propName] < b[propName] ? (-1 * rev) : (1 * rev);
    }

    private setupToolbarConfig() {
        const reg = this.registers.find(r => r.Register === this.register);
        let title = 'ACCOUNTING.POSTPOST.TITLE~';
        if (reg) {
            title += ` - ${reg._DisplayName}`;
        }

        this.toolbarconfig = {
            title: title,
            contextmenu: [
                { label: 'Eksport kontoliste' , action: () => this.exportAccounts() },
                { label: 'ACCOUNTING.POSTPOST.EXPORT', action: () => this.exportOpenPosts() },
                { label: 'ACCOUNTING.POSTPOST.EXPORT_ALL', action: () => this.exportAllOpenPosts() }
            ],
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
                this.activeSubAccountID = event.SubAccountID;
                const account = event;
                this.nameFromParams = account.AccountName;
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
                this.addTab();
            } else {
                this.canceled = true;
            }
        });
    }

    public onFilterClick(tab: IUniTab) {
        this.currentFilter = tab.value;
        this.postpost.showHideEntries(this.currentFilter);
        this.addTab();
        this.setupSaveActions();
    }

    public onCustomerFilterClick(tab: IUniTab) {
        // Dont run if tab is activated from param value. Causes double calles to reloadRegister!
        if (this.initial) {
            return;
        }
        this.addTab();
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

    public setAccount() {
        if (this.filteredAccounts.length) {
            if (this.nameFromParams) {
                const index = this.filteredAccounts.findIndex(acc => acc.AccountName === this.nameFromParams);
                if (index !== -1) {
                    this.onRowSelected(this.filteredAccounts[index]);
                    setTimeout(() => {
                        const list = document.getElementById('role-info');
                        const listElement = document.getElementsByClassName('selected')[0];
                        list.scrollTop = listElement['offsetTop'];
                    });
                } else {
                    this.onRowSelected(this.filteredAccounts[0]);
                }
            } else {
                this.onRowSelected(this.filteredAccounts[0]);
            }
        }
        this.scrollbar.update();
    }

    private checkForDiff() {
        return new Promise((resolve, reject) => {
            if (this.register === 'account') {
                resolve(true);
            } else {
                this.statisticsService.GetAll(
                    'model=journalentryline&select=Account.AccountNumber as AccountNumber,Account.AccountName as AccountName,' +
                    'SubAccount.AccountNumber,SubAccount.AccountName,sum(Amount) as Sum,count(ID) as count,' +
                    'sum(casewhen(statuscode eq 31004\,0\,RestAmount)) as RestAmount' +
                    `,SubAccount.id as SubAccountID&filter=SubAccountid gt 0 and statuscode le 31003 and subaccount.${this.register}id ` +
                    'gt 0 and isnull(StatusCode,0) ne 31004&top=&having=sum(amount) ' +
                    'ne sum(restamount)&expand=account,subaccount').subscribe((res) => {
                        if (res && res.Data && res.Data.length) {
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    }, err => {
                        resolve(true);
                    });
            }
        });
    }

    private loadCustomers() {
        const query = this.mainTabs[this.mainActiveIndex].value !== 'DIFF'
            ? `model=JournalEntryLine&` +
                `select=Customer.ID as ID,Customer.CustomerNumber as AccountNumber,` +
                `Info.Name as AccountName,sum(RestAmount) as SumAmount,count(ID) as count,SubAccount.id as SubAccountID&` +
                `expand=SubAccount,SubAccount.Customer,SubAccount.Customer.Info&` +
                `filter=isnull(StatusCode,0) ne 31004 and SubAccount.CustomerID gt 0 ` +
                (this.mainTabs[this.mainActiveIndex].value === 'ALL' ? `${this.getStatusFilter()}` : '')  +
                `&orderby=Customer.CustomerNumber`
            : 'model=JournalEntryLine&' +
                `select=Customer.ID as ID,Customer.CustomerNumber as AccountNumber,count(ID) as count,` +
                `Info.Name as AccountName,sum(casewhen(statuscode eq 31004\,0\,RestAmount)) as ` +
                `SumAmount,sum(Amount) as Balance,SubAccount.id as SubAccountID&` +
                'expand=SubAccount,SubAccount.Customer,SubAccount.Customer.Info&' +
                `filter=isnull(StatusCode,0) ne 31004 and SubAccountid gt 0 and subaccount.customerid gt 0&` +
                'having=sum(amount) ne sum(casewhen(statuscode eq 31004\,0\,RestAmount))' +
                '&expand=account,subaccount&orderby=Customer.CustomerNumber';
        this.statisticsService.GetAllUnwrapped(query)
            .subscribe(accounts => {
                this.accounts = accounts;
                this.filteredAccounts = this.getFilteredAccounts(true);
                this.setAccount();
            });
    }

    private loadSuppliers() {
        const query = this.mainTabs[this.mainActiveIndex].value !== 'DIFF'
            ? `model=JournalEntryLine&` +
                `select=Supplier.ID as ID,Supplier.SupplierNumber as AccountNumber,` +
                `Info.Name as AccountName,sum(RestAmount) as SumAmount,count(ID) as count,SubAccount.id as SubAccountID&` +
                `expand=SubAccount,SubAccount.Supplier,SubAccount.Supplier.Info&` +
                `filter=isnull(StatusCode,0) ne 31004 and SubAccount.SupplierID gt 0 ` +
                (this.mainTabs[this.mainActiveIndex].value === 'ALL' ? `${this.getStatusFilter()}` : '')  +
                `&orderby=Supplier.SupplierNumber`
            :   `model=JournalEntryLine&` +
                `select=Supplier.ID as ID,Supplier.SupplierNumber as AccountNumber,count(ID) as count,` +
                `Info.Name as AccountName,sum(casewhen(statuscode eq 31004\,0\,RestAmount)) ` +
                `as SumAmount,sum(Amount) as Balance,SubAccount.id as SubAccountID&` +
                `expand=SubAccount,SubAccount.Supplier,SubAccount.Supplier.Info&` +
                `filter=isnull(StatusCode,0) ne 31004 and SubAccountid gt 0 and subaccount.supplierid gt 0&` +
                'having=sum(amount) ne sum(casewhen(statuscode eq 31004\,0\,RestAmount))' +
                '&expand=account,subaccount&orderby=Supplier.SupplierNumber';
        this.statisticsService.GetAllUnwrapped(query)
            .subscribe(accounts => {
                this.accounts = accounts;
                this.filteredAccounts = this.getFilteredAccounts(true);
                this.setAccount();
            });
    }

    private loadAccounts() {
        this.statisticsService.GetAllUnwrapped(`model=JournalEntryLine&` +
        `select=Account.ID as ID,Account.AccountNumber as AccountNumber,count(ID) as count,` +
        `Account.AccountName as AccountName,sum(RestAmount) as SumAmount&expand=Account&` +
        `filter=isnull(StatusCode,0) ne 31004 and Account.UsePostPost eq 1 and ` +
        `Account.AccountGroupID gt 0 and (StatusCode eq 31001 or StatusCode eq 31002)` +
        `&orderby=Account.AccountNumber`)
            .subscribe(accounts => {
                this.accounts = accounts;
                this.filteredAccounts = this.getFilteredAccounts(true);
                this.setAccount();
            });
    }

    public reloadRegister() {
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
        this.mainActiveIndex = 0;
        this.mainTabs[1].disabled = this.register === 'account';
        this.addTab();
        this.setupToolbarConfig();

        switch (this.register) {
            case 'customer':
                this.checkForDiff().then((res: boolean) => {
                    this.mainTabs[2].disabled = res;
                    this.mainTabs = [...this.mainTabs];
                    this.supplier$.next(null);
                    this.account$.next(null);
                    this.loadCustomers();
                });
                break;
            case 'supplier':
                this.checkForDiff().then((res: boolean) => {
                    this.mainTabs[2].disabled = res;
                    this.mainTabs = [...this.mainTabs];
                    this.customer$.next(null);
                    this.account$.next(null);
                    this.loadSuppliers();
                });
                break;
            case 'account':
                this.mainTabs[1].disabled = true;
                this.mainTabs[2].disabled = true;
                this.mainTabs = [...this.mainTabs];
                this.customer$.next(null);
                this.supplier$.next(null);
                this.loadAccounts();
                break;
        }
    }
}
