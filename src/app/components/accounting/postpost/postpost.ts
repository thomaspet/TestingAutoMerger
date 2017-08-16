import {ViewChild, Component} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniTableColumn, UniTableColumnType, UniTableConfig, UniTable} from '../../../../framework/ui/unitable/index';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniModalService} from '../../../../framework/uniModal/barrel';
import {IToolbarConfig, IAutoCompleteConfig} from './../../common/toolbar/toolbar';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {
    Customer,
    Supplier,
    Account,
    StatusCodeJournalEntryLine
} from '../../../unientities';
import {
    ErrorService,
    AccountService,
    StatisticsService,
    JournalEntryLineService
} from '../../../services/services';

@Component({
    selector: 'postpost',
    templateUrl: './postpost.html'
})
export class PostPost {
    @ViewChild(UniTable)
    private table: UniTable;

    public customer$: BehaviorSubject<Customer> = new BehaviorSubject(null);
    public supplier$: BehaviorSubject<Supplier> = new BehaviorSubject(null);
    public account$: BehaviorSubject<Account> = new BehaviorSubject(null);
    public accounts$: BehaviorSubject<any> = new BehaviorSubject(null);
    public accountsTableConfig: UniTableConfig;

    private toolbarconfig: IToolbarConfig;
    private accountSearch: IAutoCompleteConfig;
    private registerConfig: any;
    private register: string = 'customer';
    private selectedIndex: number = 0;

    constructor(
        private tabService: TabService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private accountService: AccountService,
        private statisticsService: StatisticsService,
        private journalEntryLineService: JournalEntryLineService
    ) {
        this.setupAccountsTable();
        this.setupAccountSearch();
        this.setupToolbarConfig();
        this.setTabTitle();
        this.loadCustomers();
    }

    public ngOnInit() {
        this.accounts$.subscribe(() => {
            this.selectedIndex = 0;
            this.focusRow();
        });
    }

    public focusRow(index = undefined) {
        if (this.table) {
            this.table.focusRow(index === undefined ? this.selectedIndex : index);
        }
    }

    private setupToolbarConfig() {
        this.toolbarconfig = {
            navigation: {
                prev: this.previousAccount.bind(this),
                next: this.nextAccount.bind(this)
            },
            contextmenu: []
        };

        let items = [
                {Register: 'customer', _DisplayName: 'Kunde'},
                {Register: 'supplier', _DisplayName: 'Leverandør'},
                {Register: 'account', _DisplayName: 'Hovedbok'}
        ];

        this.registerConfig = {
            items: items,
            selectedItem: items.find(x => x.Register == this.register),
            displayField: 'Name',
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

    private setupAccountSearch() {
        this.accountSearch = {
            events: {
                select: (model, value: any) => {
                    if (value) {
                        // TODO
                    }
                }
            },
            valueProperty: 'period',
            template: (obj: any) =>
                obj
                    ? `${obj.ID} - ${obj.Name}`
                    : '',
            source: []
        };
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
    }

    private loadCustomers() {
        this.statisticsService
            .GetAllUnwrapped(`model=JournalEntryLine&` +
                             `select=Customer.ID as ID,Customer.CustomerNumber as AccountNumber,Info.Name as AccountName,sum(Amount) as SumAmount&` +
                             `expand=SubAccount,SubAccount.Customer,SubAccount.Customer.Info&` +
                             `filter=SubAccount.CustomerID gt 0 and StatusCode eq ${StatusCodeJournalEntryLine.Open}&` +
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
                             `filter=SubAccount.SupplierID gt 0 and StatusCode eq ${StatusCodeJournalEntryLine.Open}&` +
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
                             `filter=Account.UsePostPost eq 1 and StatusCode eq ${StatusCodeJournalEntryLine.Open}&` +
                             `orderby=Account.AccountNumber`)
            .subscribe(accounts => {
                this.accounts$.next(accounts);
            });
    }

    private onRegisterChange(register) {
        this.register = register.Register;
        switch (register.Register) {
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
            .setWidth('2rem')
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
        let restamountCol = new UniTableColumn('SumAmount', 'Sum åpne poster', UniTableColumnType.Number)
            .setWidth('3em');

        this.accountsTableConfig = new UniTableConfig(false, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setMultiRowSelect(false)
            .setAutoAddNewRow(false)
            .setColumns([accountCol, nameCol, restamountCol]);
    }
}
