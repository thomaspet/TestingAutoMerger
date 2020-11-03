import { Component, OnInit, ViewChild } from '@angular/core';
import { Account } from '@uni-entities';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { IAutoCompleteOptions } from '@uni-framework/ui/unitable/controls';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';
import { IncomingBalanceLogicService } from '../../shared/services/incoming-balance-logic.service';
import { IIncomingBalanceLine } from '../../services/incoming-balance-store.service';
import { IncomingBalanceCustomersStoreService } from '../shared/services/incoming-balance-customers-store.service';
import { UniTranslationService } from '@app/services/services';
import { Subject } from 'rxjs';
import { IRowChangeEvent } from '@uni-framework/ui/ag-grid/interfaces';

@Component({
    selector: 'uni-incoming-balance-customers',
    templateUrl: './incoming-balance-customers.component.html',
    styleUrls: ['./incoming-balance-customers.component.sass']
})
export class IncomingBalanceCustomersComponent implements OnInit {
    balanceConfig: UniTableConfig;
    @ViewChild(AgGridWrapper) table: AgGridWrapper;
    private destroy$: Subject<any> = new Subject();

    constructor(
        public stateService: IncomingBalanceCustomersStoreService,
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
        this.logicService.reportRoute('customers');
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    addRow() {
        this.table.addRow(null);
    }

    onRowChange(event: IRowChangeEvent) {
        this.stateService
            .createOrUpdate(event.rowModel)
            .pipe(
                filter(() => event.field === 'Amount'),
                switchMap(() => this.stateService.journalLines$),
                take(1),
                filter(rows => event.originalIndex === (rows.length - 1))
            )
            .subscribe(() => setTimeout(() => this.addRow()));
    }

    onRowDelete(row: IIncomingBalanceLine) {
        this.stateService.remove(row).subscribe();
    }

    private setConfig(isBooked: boolean) {
        const accountCol = new UniTableColumn(
                'SubAccount',
                this.translationService.translate('SETTINGS.INCOMING_BALANCE.CUSTOMERS.CUSTOMER_LABEL'),
                UniTableColumnType.Lookup,
                (line: IIncomingBalanceLine) => !line._booked
            )
            .setTemplate((row: IIncomingBalanceLine) => row?.SubAccount
                ? `${row.SubAccount?.AccountNumber} ${row.SubAccount?.Customer?.Info?.Name || ''}`
                : ''
            )
            .setOptions(<IAutoCompleteOptions>{
                itemTemplate: (selectedItem: Account) => !!selectedItem?.AccountNumber
                    ? `${selectedItem.AccountNumber} ${selectedItem.Customer?.Info?.Name}`
                    : '',
                lookupFunction: (query: string) => this.logicService.subAccountSearch(query, 'Customer'),
                addNewButton: {
                    label: 'Opprett ny kunde',
                    action: (search) => this.logicService.addNewSubAccount(search, 'Customer'),
                },
                resultTableConfig: {
                    fields: [
                        {header: 'Kundenr', key: 'AccountNumber'},
                        {header: 'Navn', key: '_name'},
                        {header: 'Orgnummer', key: '_orgnumber'},
                    ]
                },
                showResultAsTable: true,
            });
        const invoiceCol = new UniTableColumn(
            'InvoiceNumber',
            this.translationService.translate('SETTINGS.INCOMING_BALANCE.COMMON.INVOICE_LABEL'),
            UniTableColumnType.Text,
            (line: IIncomingBalanceLine) => !line._booked
        );
        const amountCol = new UniTableColumn(
            'Amount',
            this.translationService.translate('SETTINGS.INCOMING_BALANCE.COMMON.AMOUNT_LABEL'),
            UniTableColumnType.Money,
            (line: IIncomingBalanceLine) => !line._booked
        );
        this.balanceConfig = new UniTableConfig('settings.incoming-balance.wizard.customers', true)
            .setColumns([accountCol, invoiceCol, amountCol])
            .setAutoAddNewRow(false)
            .setDeleteButton(!isBooked)
            .setCopyFromCellAbove(false)
            .setColumnMenuVisible(false);
    }

}
