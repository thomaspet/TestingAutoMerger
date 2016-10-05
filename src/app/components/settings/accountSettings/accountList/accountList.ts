import {Component, Output, EventEmitter, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {URLSearchParams} from '@angular/http';
import {Account} from '../../../../unientities';
import {AccountService} from '../../../../services/services';

declare var _;

@Component({
    selector: 'account-list',
    templateUrl: 'app/components/settings/accountSettings/accountList/accountList.html'
})
export class AccountList {
    @Output() public uniAccountChange: EventEmitter<Account> = new EventEmitter<Account>();
    @ViewChild(UniTable) private table: UniTable;
    private accountTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    
    constructor(private accountService: AccountService) {
        
    }

    public ngOnInit() {
        this.setupTable();
    }

    private onRowSelected (event) {
        this.uniAccountChange.emit(event.rowModel);
    };

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
            
            params.set('expand', 'AccountGroup,VatType');
            
            return this.accountService.GetAllByUrlSearchParams(params);
        };
        
        // Define columns to use in the table
        let accountNumberCol = new UniTableColumn('AccountNumber', 'Kontonr',  UniTableColumnType.Number)
            .setWidth('5rem')
            .setFilterOperator('eq');

        let accountNameCol = new UniTableColumn('AccountName', 'Kontonavn',  UniTableColumnType.Text)
            .setFilterOperator('contains');

        let accountGroupNameCol = new UniTableColumn('AccountGroup.Name', 'Gruppe',  UniTableColumnType.Text)
            .setFilterOperator('contains');


        let vatTypeCol = new UniTableColumn('VatType.VatCode', 'Mva', UniTableColumnType.Text)
            .setWidth('7rem')
            .setTemplate((account: Account) => {
                if (account.VatType !== null) {
                    return account.VatType.VatCode + ' - ' + account.VatType.VatPercent + '%';
                } else {
                    return '';
                }   
            })
            .setFilterable(false);

        let lockedCol = new UniTableColumn('Visible', 'Synlig/låst',  UniTableColumnType.Text)
            .setFilterable(false)
            .setCls('icon-column')
            .setTemplate((rowModel: Account) => {
                let iconsHtml = '';
                if (rowModel.Visible) {
                    iconsHtml += '<span class="is-visible" role="presentation">Visible</span>';
                } else {
                    iconsHtml += '<span class="is-hidden" role="presentation">Hidden</span>';
                } 
                if (rowModel.Locked) {
                    iconsHtml += '<span class="is-locked" role="presentation">Locked</span>';
                } else {
                    iconsHtml += '<span class="is-unlocked" role="presentation">Unlocked</span>';
                }
                return iconsHtml;
            })
            .setWidth('5rem');
                 
        // Setup table
        this.accountTable = new UniTableConfig(false, true, 25)            
            .setSearchable(true)            
            .setColumns([accountNumberCol, accountNameCol, accountGroupNameCol, vatTypeCol, lockedCol]);
    }
}
