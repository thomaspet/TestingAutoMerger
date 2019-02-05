import {
    Component,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    OnInit,
    AfterViewInit
} from '@angular/core';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '@uni-framework/ui/unitable/index';
import {URLSearchParams} from '@angular/http';
import {Account} from '../../../../unientities';
import {AccountService, ErrorService} from '../../../../services/services';


@Component({
    selector: 'account-list',
    templateUrl: './accountList.html'
})
export class AccountList implements OnInit, AfterViewInit {
    @Output() public uniAccountChange: EventEmitter<Account> = new EventEmitter<Account>();
    @ViewChild(UniTable) private table: UniTable;
    public accountTable: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private accountService: AccountService,
        private errorService: ErrorService,
        private elementRef: ElementRef
    ) {}

    public ngOnInit() {
        this.setupTable();
    }

    public ngAfterViewInit() {
        const input = this.elementRef.nativeElement.querySelector('input');
        input.focus();
    }

    public onRowSelected (event) {
        this.uniAccountChange.emit(event.rowModel);
    }

    public refresh() {
        this.table.refreshTableData();
    }

    private setupTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            if (!params.get('orderby')) {
                params.set('orderby', 'AccountNumber');
            }

            if (!params.get('filter')) {
                params.set('filter', 'AccountID eq null');
            } else {
                params.set('filter', '( ' + params.get('filter') + ' ) and AccountID eq null');
            }

            params.set('expand', 'AccountGroup,VatType');

            return this.accountService.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Define columns to use in the table
        const accountNumberCol = new UniTableColumn('AccountNumber', 'Kontonr',  UniTableColumnType.Link)
            .setWidth('5rem')
            .setFilterOperator('startswith')
            .setLinkResolver(row => `/accounting/accountquery?account=${row.AccountNumber}`);

        const accountNameCol = new UniTableColumn('AccountName', 'Kontonavn',  UniTableColumnType.Text)
            .setFilterOperator('contains');

        const accountGroupNameCol = new UniTableColumn('AccountGroup.Name', 'Gruppe',  UniTableColumnType.Text)
            .setFilterOperator('contains');


        const vatTypeCol = new UniTableColumn('VatType.VatCode', 'Mva', UniTableColumnType.Text)
            .setWidth('7rem')
            .setTemplate((account: Account) => {
                if (account.VatType !== null) {
                    return account.VatType.VatCode + ' - ' + account.VatType.Name;
                } else {
                    return '';
                }
            })
            .setFilterable(false);

        const visibilityCol = new UniTableColumn('Visible', 'Synlig', UniTableColumnType.Boolean)
            .setFilterable(false)
            .setWidth('5rem')
            .setAlignment('center')
            .setConditionalCls(rowModel => {
                if (rowModel.Visible) {
                    return 'is-visible';
                } else {
                    return 'is-hidden';
                }
            });

        const lockedCol = new UniTableColumn('Locked', 'Sperret',  UniTableColumnType.Boolean)
            .setFilterable(false)
            .setWidth('5rem')
            .setAlignment('center')
            .setConditionalCls(rowModel => {
                if (rowModel.Locked) {
                    return 'is-locked';
                } else {
                    return 'is-unlocked';
                }
            });

        const doSynchronizeCol = new UniTableColumn('DoSynchronize', 'Synkronisér', UniTableColumnType.Boolean)    
            .setFilterable(true)
            .setWidth('5rem')
            .setAlignment('center')
            ;

        // Setup table
        this.accountTable = new UniTableConfig('accounting.accountSettings.accountList', false, true, 15)
            .setSearchable(true)
            .setColumns([accountNumberCol, accountNameCol, accountGroupNameCol, vatTypeCol, visibilityCol, lockedCol, doSynchronizeCol]);
    }
}
