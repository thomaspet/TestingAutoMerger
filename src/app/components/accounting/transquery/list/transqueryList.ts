import {Component, ViewChild} from '@angular/core';
import {IToolbarConfig} from '../../../../components/common/toolbar/toolbar';
import {UniTableColumn, UniTableConfig} from 'unitable-ng2/main';
import {UniForm} from 'uniform-ng2/main';
import {Router} from '@angular/router';
import {Account} from '../../../../unientities';
import {FieldType} from 'uniform-ng2/main';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {
    ErrorService,
    AccountService,
    JournalEntryService
} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
declare var jQuery;
declare var moment;

@Component({
    selector: 'customer-list',
    templateUrl: 'app/components/accounting/transquery/list/transqueryList.html',
})
export class TransqueryList {
    @ViewChild(UniForm) public form: UniForm;

    private searchParams$: BehaviorSubject<any> = new BehaviorSubject({});
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private periodeTable: UniTableConfig;
    private account: any;
    private periods$: Observable<any>;
    private isIncomingBalance: boolean;
    public toolbarconfig: IToolbarConfig = {
        title: 'Ny kontoforespørsel'
    };

    constructor(
        private router: Router,
        private accountService: AccountService,
        private journalEntryService: JournalEntryService,
        private tabService: TabService,
        private errorService: ErrorService
    ) {
        this.setupPeriodeTable();
        this.tabService.addTab({ name: 'Forspørsel konto', url: '/accounting/transquery/list', moduleID: UniModules.Transquery, active: true });
    }

    public ngOnInit() {
        this.fields$.next(this.getLayout().Fields);
        this.searchParams$.next({
            Account: null
        });
    }

    private loadTableData(account: Account) {
        this.account = account;
        if (account) {
            this.periods$ = this.journalEntryService.getJournalEntryPeriodData(account.ID)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            this.periods$.subscribe((data) => {
               this.isIncomingBalance = data.find(period => period.PeriodNo == 0) != null;
            });
            this.toolbarconfig.title = account.AccountNumber + ' – ' + account.AccountName;
        } else {
            this.toolbarconfig.title = 'Ny kontoforespørsel';
        }
    }

    private setupPeriodeTable() {
        var year: number = moment().year();

        // Define columns to use in the table
        let periodeCol = new UniTableColumn('PeriodName', 'Periode').setWidth('60%');
        let lastYearCol = new UniTableColumn('PeriodSumYear1', `Regnskapsår ${year - 1}`)
            .setTemplate((period) => {
                return `<a href='/#/accounting/transquery/details;Account_AccountNumber=${this.account.AccountNumber};year=${year - 1};period=${period.PeriodNo};isIncomingBalance=${this.isIncomingBalance}'>${period.PeriodSumYear1}</a>`;
            });
        let thisYearCol = new UniTableColumn('PeriodSumYear2', `Regnskapsår ${year}`)
            .setTemplate((period) => {
                return `<a href='/#/accounting/transquery/details;Account_AccountNumber=${this.account.AccountNumber};year=${year    };period=${period.PeriodNo};isIncomingBalance=${this.isIncomingBalance}'>${period.PeriodSumYear2}</a>`;
            });

        // Setup table
        this.periodeTable = new UniTableConfig(false, false)
            .setColumns([periodeCol, lastYearCol, thisYearCol])
            .setColumnMenuVisible(false);
    }

    private getLayout() {
        return {
            Name: 'TransqueryList',
            BaseEntity: 'Account',
            StatusCode: 0,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'JournalEntryLine',
                    Property: 'AccountID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Konto',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    Options: {
                        source: [],
                        search: (query: string) => this.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`),
                        displayProperty: 'AccountName',
                        valueProperty: 'ID',
                        template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
                        minLength: 1,
                        debounceTime: 200,
                        events: {
                            select: (model: any) => {
                                this.accountService.Get(model.AccountID)
                                    .subscribe((account: Account) => {
                                        this.loadTableData(account);
                                    });
                            }
                        }
                    }
                }
            ]
        };
    }
}
