import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Account } from '@uni-entities';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { IAutoCompleteOptions } from '@uni-framework/ui/unitable/controls';
import { take, takeUntil } from 'rxjs/operators';
import { IncomingBalanceLogicService } from '../../shared/services/incoming-balance-logic.service';
import { IIncomingBalanceLine } from '../../services/incoming-balance-store.service';
import { IncomingBalanceSupplierStoreService } from '../shared/services/incoming-balance-supplier-store.service';
import { UniTranslationService } from '@app/services/services';
import { Subject } from 'rxjs';

@Component({
    selector: 'uni-incoming-balance-suppliers',
    templateUrl: './incoming-balance-suppliers.component.html',
    styleUrls: ['./incoming-balance-suppliers.component.sass']
    })
export class IncomingBalanceSuppliersComponent implements OnInit, OnDestroy {
    balanceConfig: UniTableConfig;
    @ViewChild(AgGridWrapper) table: AgGridWrapper;
    private destroy$: Subject<any> = new Subject();

    constructor(
        public stateService: IncomingBalanceSupplierStoreService,
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
        this.logicService.reportRoute('suppliers');
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
                'SubAccount',
                this.translationService.translate('SETTINGS.INCOMING_BALANCE.SUPPLIERS.SUPPLIER_LABEL'),
                UniTableColumnType.Lookup,
                (line: IIncomingBalanceLine) => !line._booked
            )
            .setTemplate((row: IIncomingBalanceLine) => row?.SubAccount
                ? `${row.SubAccount?.AccountNumber} ${row.SubAccount?.Supplier?.Info?.Name || ''}`
                : ''
            )
            .setOptions(<IAutoCompleteOptions>{
                itemTemplate: (selectedItem: Account) => !!selectedItem?.AccountNumber
                    ? `${selectedItem.AccountNumber} ${selectedItem.Supplier?.Info?.Name}`
                    : '',
                lookupFunction: (query: string) => this.logicService.subAccountSearch(query, 'Supplier'),
                addNewButton: {
                    label: 'Opprett ny leverandør',
                    action: (search) => this.logicService.addNewSubAccount(search, 'Supplier'),
                },
                resultTableConfig: {
                    fields: [
                        {header: 'Leverandørnr', key: 'AccountNumber'},
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
        this.balanceConfig = new UniTableConfig('settings.incoming-balance.wizard.balance', true)
            .setColumns([accountCol, invoiceCol, amountCol])
            .setAutoAddNewRow(false)
            .setDeleteButton(!isBooked)
            .setCopyFromCellAbove(false);
    }

}
