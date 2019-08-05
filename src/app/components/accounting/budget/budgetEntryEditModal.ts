import {Component, Input, Output, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {StatisticsService, BudgetService} from '@app/services/services';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType
} from '../../../../framework/ui/unitable/index';

@Component({
    selector: 'uni-budget-download-template-modal',
    template: `
    <section role="dialog" class="uni-modal uni-redesign" style="width: 80vw; font-size: .9rem">
        <header><h1>Budsjettspost</h1></header>

        <article class="budget-entry-modal-container">
            <div class="budget-entry-modal-info-container">
                <h4>
                    Redigering av budsjettpost.
                </h4>

                <i class="material-icons tab-tooltip" matTooltip="{{ infoMessage }}">
                    info
                </i>
            </div>

            <ag-grid-wrapper
                class="transquery-grid-font-size"
                [resource]="posts"
                [config]="uniTableConfig">
            </ag-grid-wrapper>
        </article>

        <footer>
            <button (click)="save()" class="good">Lagre</button>
            <button (click)="close()" class="bad">Avbryt</button>
        </footer>
    </section>
    `
})

export class UniBudgetEntryEditModal implements OnInit, IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(AgGridWrapper)
    private table: AgGridWrapper;

    public posts: any[] = [
        this.getEmptyLine()
    ];

    private MONTHS_SHORT: string[] = [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ];

    public entriesArray = this.getEmptyEntriesArray();

    public uniTableConfig: UniTableConfig;

    public infoMessage = 'Om du setter verdi i Sum-kolonnen, vil den fordeles likt på 12mnd. ' +
        'Hvis du velger en salgskonto (Kontogruppe 3), vil vi snu fortegn for deg.';

    constructor(
        private statisticsService: StatisticsService,
        private budgetService: BudgetService
    ) {}

    public ngOnInit() {
        if (this.options && this.options.data && this.options.data.entries) {
            this.options.data.entries.forEach((entry) => {
                this.posts[0]['Amount' + entry.PeriodNumber] = entry.Amount;
                this.entriesArray[entry.PeriodNumber - 1] = entry;
            });
            this.posts[0].Sum = this.sumAllAmounts(this.posts[0]);
            this.posts[0].Account = this.options.data.entries[0].Account;
            this.posts = [].concat(this.posts);
        }
        this.setUpTable();
    }

    public save() {

        // Close editor before saving
        this.table.finishEdit().then(() => {
            if (!this.posts[0].Account) {
                return;
            }
            // Create all budget entries and save them
            const entries = [];

            const depID = (
                this.options &&
                this.options.data &&
                this.options.data.department &&
                this.options.data.department.ID !== 'ALLDEPARTMENTSID')
            ? this.options.data.department.ID
            : 0;

            this.entriesArray.forEach((entry) => {
                if (entry._hasChanged) {
                    entry.Amount = this.posts[0]['Amount' + entry.PeriodNumber];
                    entry.Account = this.posts[0].Account;
                    entry.AccountID = this.posts[0].Account.ID,
                    entry.BudgetID = this.options.data.BudgetID;
                    if (!entry.DimensionsID && depID) {
                        entry.Dimensions = {
                            _createguid: this.statisticsService.getNewGuid(),
                            DepartmentID: depID
                        };
                    }
                    entries.push(entry);
                }
            });
            this.onClose.emit(entries);
        });
    }

    public close() {
        this.onClose.emit();
    }

    private setUpTable() {
        const cols = [
            new UniTableColumn('Account', 'Konto', UniTableColumnType.Lookup )
                .setDisplayField('Account.AccountNumber')
                .setTemplate((rowModel) => {
                    if (rowModel.Account) {
                        const account = rowModel.Account;
                        return account.AccountNumber
                            + ': '
                            + account.AccountName;
                    }
                    return '';
                })
                .setWidth('20rem')
                .setOptions({
                    itemTemplate: (selectedItem) => {
                        return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                    },
                    lookupFunction: (searchValue) => {
                        return this.accountSearch(searchValue);
                    }
                }),
            new UniTableColumn('Sum', 'Sum', UniTableColumnType.Number)
            .setConditionalCls(row => this.getCellClass(row, 'Sum'))
            .setTemplate(row => row.Sum.toString().replace('-', ''))
        ];

        for (let i = 1; i <= 12; i++) {
            cols.push(
                new UniTableColumn('Amount' + i, this.MONTHS_SHORT[i - 1], UniTableColumnType.Number)
                    .setConditionalCls(row => this.getCellClass(row, 'Amount' + i))
                    .setTemplate(row => row['Amount' + i].toString().replace('-', '')),
            );
        }

        this.uniTableConfig = new UniTableConfig('', true, false, 1)
            .setColumns(cols)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(false)
            .setChangeCallback((event) => {
                if (event.field === 'Sum' && (event.newValue || event.newValue === 0)) {

                    // If account is sales account, multiply with -1
                    const multiplier = this.posts[0].Account
                        && this.posts[0].Account.AccountNumber >= 3000
                        && this.posts[0].Account.AccountNumber <= 3999
                        ? -1
                        : 1;

                    // Divide sum equaly on all months
                    let sumOnAll;
                    if (event.newValue === 0) {
                        sumOnAll = 0;
                    } else {
                        const flip = event.newValue > 0 ? 1 : -1;
                        sumOnAll = Math.floor(Math.abs(event.newValue / 12)) * flip;
                    }

                    for (let i = 1; i <= 12; i++) {
                        this.posts[0]['Amount' + i] = sumOnAll * multiplier;
                        this.entriesArray[i - 1]['_hasChanged'] = true;
                    }

                    // Add rest to the last post
                    this.posts[0]['Amount12'] += (event.newValue % 12) * multiplier;
                    this.posts[0].Sum = event.newValue * multiplier;
                    this.posts = [].concat(this.posts);
                } else if (event.field.includes('Amount')) {
                    // If account is sales account, multiply with -1
                    const multiplier = this.posts[0].Account
                        && this.posts[0].Account.AccountNumber >= 3000
                        && this.posts[0].Account.AccountNumber <= 3999
                        ? -1
                        : 1;
                    // Update sum when adding an period value..
                    this.posts[0][event.field] = event.newValue * multiplier;
                    this.posts[0].Sum = this.sumAllAmounts(this.posts[0]);
                    this.entriesArray[parseInt(event.field.substr(6, event.field.length), 10) - 1]['_hasChanged'] = true;
                    this.posts = [].concat(this.posts);
                } else if (event.field === 'Account') {
                    if (event.newValue) {
                        this.checkIfDuplicateEntry(event.newValue).subscribe((entries) => {
                            if (entries) {
                                entries.forEach((entry) => {
                                    this.posts[0]['Amount' + entry.PeriodNumber] = entry.Amount;
                                    entry['_hasChanged'] = false;
                                    this.entriesArray[entry.PeriodNumber - 1] = entry;
                                });

                                this.posts[0].Sum = this.sumAllAmounts(event.rowModel);
                            }
                            this.posts = [].concat(this.posts);
                        });
                    }
                }
            });
    }

    private getCellClass(row, key) {
        if (row.Account && row.Account.AccountNumber < 4000 && row[key] < 0) {
            return 'budget-sales-account-number';
        } else if (row.Account && row.Account.AccountNumber < 4000 && row[key] > 0) {
            return 'budget-sales-account-number-bad';
        } else if (row.Account && row.Account.AccountNumber >= 4000 && row[key] < 0) {
            return 'budget-sales-account-number';
        } else if (row.Account && row.Account.AccountNumber >= 4000 && row[key] > 0) {
            return 'budget-sales-account-number-bad';
        }
        return '';
    }

    private sumAllAmounts(model) {
        let sum = 0;
        for (let i = 1; i <= 12; i++) {
            sum += model['Amount' + i];
        }
        return sum;
    }

    public addPost() {
        this.posts.push(this.getEmptyLine());
        this.posts = [].concat(this.posts);
    }

    private accountSearch(searchValue) {
        const select = 'ID as ID,AccountNumber as AccountNumber,AccountName as AccountName';
        let filter = `Visible eq 'true' and AccountNumber ge 3000 and AccountNumber le 9999 `;
        if (!searchValue || isNaN(searchValue)) {
            filter += `and contains(AccountName, '${searchValue}')`;
        } else {
            filter += `and startswith(AccountNumber\,'${searchValue}')`;
        }
        return this.statisticsService.GetAll(`model=Account&top=100&filter=${filter}&select=${select}&orderby=AccountNumber`)
            .map(res => res.Data);
    }

    private checkIfDuplicateEntry(account) {
        return this.budgetService.getEntriesFromBudgetIDAndAccount(
            this.options.data.BudgetID,
            account.AccountNumber,
            this.options.data.department.ID !== 'ALLDEPARTMENTSID' ? this.options.data.department.ID : null
        );
    }

    private getEmptyLine() {
        return {
            Account: null,
            Sum: 0,
            Amount1: 0,
            Amount2: 0,
            Amount3: 0,
            Amount4: 0,
            Amount5: 0,
            Amount6: 0,
            Amount7: 0,
            Amount8: 0,
            Amount9: 0,
            Amount10: 0,
            Amount11: 0,
            Amount12: 0,
        };
    }

    private getEmptyEntriesArray() {
        const entries = [];
        for (let i = 1; i <= 12; i++) {
            entries.push({
                AccountID: 0,
                Amount: 0,
                ID: 0,
                PeriodNumber: i,
                DimensionsID: null,
                _hasChanged: false,
                _createguid: this.statisticsService.getNewGuid()
            });
        }
        return entries;
    }
}
