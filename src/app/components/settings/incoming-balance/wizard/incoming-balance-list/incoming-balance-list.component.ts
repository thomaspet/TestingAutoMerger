import { Component, OnInit, ViewChild } from '@angular/core';
import { Account } from '@uni-entities';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { take, takeUntil, tap } from 'rxjs/operators';
import { IncomingBalanceLogicService } from '../../shared/services/incoming-balance-logic.service';
import { IIncomingBalanceLine } from '../../services/incoming-balance-store.service';
import { IncomingBalanceListStoreService } from '../shared/services/incoming-balance-list-store.service';
import { UniTranslationService } from '@app/services/services';
import { Subject } from 'rxjs';

@Component({
    selector: 'uni-incoming-balance-list',
    templateUrl: './incoming-balance-list.component.html',
    styleUrls: ['./incoming-balance-list.component.sass']
})
export class IncomingBalanceBalanceComponent implements OnInit {

    balanceConfig: UniTableConfig;
    @ViewChild(AgGridWrapper) table: AgGridWrapper;
    private destroy$: Subject<any> = new Subject();

    constructor(
        public stateService: IncomingBalanceListStoreService,
        private logicService: IncomingBalanceLogicService,
        private translationService: UniTranslationService,
    ) { }

    ngOnInit(): void {
        this.stateService
            .isBooked$
            .pipe(
                takeUntil(this.destroy$),
            )
            .subscribe(isBooked => this.setConfig(isBooked));
        this.logicService.reportRoute('balance');
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    addRow() {
        this.table.addRow(null);
    }

    onRowChange(row: IIncomingBalanceLine) {
        this.stateService.createOrUpdate(row).subscribe();
    }

    onRowDelete(row: IIncomingBalanceLine) {
        this.stateService.remove(row).subscribe();
    }

    private setConfig(isBooked: boolean) {
        const accountCol = new UniTableColumn(
                'Account',
                this.translationService.translate('SETTINGS.INCOMING_BALANCE.LIST.ACCOUNT_LABEL'),
                UniTableColumnType.Lookup,
                (line: IIncomingBalanceLine) => !line._booked
            )
            .setDisplayField('Account.AccountNumber')
            .setOptions({
                itemTemplate: (selectedItem: Account) => !!selectedItem?.AccountNumber
                    ? `${selectedItem.AccountNumber} ${selectedItem.AccountName}`
                    : '',
                lookupFunction: (query: string) => !!query
                ? this.logicService.accountSearch(query)
                : []
            });
        const accountNameCol = new UniTableColumn(
                'Account.AccountName',
                this.translationService.translate('SETTINGS.INCOMING_BALANCE.LIST.ACCOUNT_NAME_LABEL'),
                UniTableColumnType.Text,
                false
            );
        const amountCol = new UniTableColumn(
                'Amount',
                this.translationService.translate('SETTINGS.INCOMING_BALANCE.COMMON.AMOUNT_LABEL'),
                UniTableColumnType.Money,
                (line: IIncomingBalanceLine) => !line._booked
            );
        this.balanceConfig = new UniTableConfig('settings.incoming-balance.wizard.balance', true)
            .setColumns([accountCol, accountNameCol, amountCol])
            .setAutoAddNewRow(false)
            .setDeleteButton(!isBooked)
            .setCopyFromCellAbove(false);
    }

}
