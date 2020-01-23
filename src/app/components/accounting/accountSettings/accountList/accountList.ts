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
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {HttpParams} from '@angular/common/http';
import {Account} from '../../../../unientities';
import {AccountService, ErrorService} from '../../../../services/services';

@Component({
    selector: 'account-list',
    templateUrl: './accountList.html'
})
export class AccountList implements OnInit, AfterViewInit {
    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;
    @Output() uniAccountChange: EventEmitter<Account> = new EventEmitter();

    accountTable: UniTableConfig;
    lookupFunction: (urlParams: HttpParams) => any;

    constructor(
        private accountService: AccountService,
        private errorService: ErrorService,
        private elementRef: ElementRef
    ) {}

    public ngOnInit() {
        this.setupTable();
    }

    public ngAfterViewInit() {
        try {
            const input = this.elementRef.nativeElement.querySelector('input');
            input.focus();
        } catch (e) {}
    }

    public onRowSelected(account) {
        this.uniAccountChange.emit(account);
    }

    public refresh() {
        this.table.refreshTableData();
    }

    private setupTable() {

        this.lookupFunction = (urlParams: HttpParams) => {
            let params = urlParams;

            if (params === null) {
                params = new HttpParams();
            }

            if (!params.get('orderby')) {
                params = params.set('orderby', 'AccountNumber');
            }

            if (!params.get('filter')) {
                params = params.set('filter', 'AccountID eq null');
            } else {
                params = params.set('filter', '( ' + params.get('filter') + ' ) and AccountID eq null');
            }

            params = params.set('expand', 'AccountGroup,VatType,MandatoryDimensions');

            return this.accountService.GetAllByHttpParams(params)
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
            .setConditionalCls(rowModel => {
                if (!rowModel.AccountSetupID) {
                    return 'is-na';
                }
            });

        // Setup table
        this.accountTable = new UniTableConfig('accounting.accountSettings.accountList', false, true, 15)
            .setSearchable(true)
            .setColumns([
                accountNumberCol,
                accountNameCol,
                accountGroupNameCol,
                vatTypeCol,
                visibilityCol,
                lockedCol,
                doSynchronizeCol
            ]);
    }
}
