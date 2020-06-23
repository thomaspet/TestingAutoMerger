import { Injectable } from '@angular/core';
import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { UniMath } from '@uni-framework/core/uniMath';
import { TravelLine, WageType, TravelType, Account } from '@uni-entities';
import { SalaryTransViewService } from '@app/components/salary/shared/services/salaryTransViewService';
import { Observable } from 'rxjs';
import { AccountService, StatisticsService } from '@app/services/services';
import { map } from 'rxjs/operators';
import { DimensionsColumnsService } from './dimensionsColumns/dimensions-columns.service';
export const INVOICE_ACCOUNT_FIELD = '_InvoiceAccount';
export const ACCOUNT_FIELD = '_Account';
export const TRAVEL_TYPE_FIELD = 'travelType';
export const WAGE_TYPE_FIELD = '_wageType';
export const VAT_TYPE_FIELD = 'VatType';
export const ROW_GUID_FIELD = '_guid';
export const IS_EMPTY_FIELD = '_isEmpty';
@Injectable()
export class TravelLinesTableService {

    constructor(
        private salaryTransViewService: SalaryTransViewService,
        private accountService: AccountService,
        private statisticsService: StatisticsService,
        private dimensionsColumnsService: DimensionsColumnsService,
    ) { }

    public getColumns(
        wageTypes$: Observable<WageType[]>,
        travelTypes$: Observable<TravelType[]>): Observable<UniTableColumn[]> {
        return this.dimensionsColumnsService
            .getDimensionColumns()
            .pipe(
                map(dimensionColumns => [
                    this.getTravelTypeColumn(travelTypes$),
                    this.getWageTypeColumn(wageTypes$),
                    this.getFromColumn(),
                    this.getToColumn(),
                    this.getAccountColumn(),
                    this.getInvoiceAccountColumn(),
                    this.getVatTypeColumn(),
                    this.getAmountColumn(),
                    this.getRateColumn(),
                    this.getSumColumn(),
                    ...dimensionColumns,
                ])
            );
    }

    private getTravelTypeColumn(travelTypes$: Observable<TravelType[]>): UniTableColumn {
        return new UniTableColumn(TRAVEL_TYPE_FIELD, 'Reisetype', UniTableColumnType.Lookup)
        .setVisible(false)
        .setTemplate((travel: TravelLine) => {
            if (!travel.travelType) {
                return '';
            }
            return `${travel.travelType.ForeignTypeID} - ${travel.travelType.Description || travel.travelType.ForeignDescription}`;
        })
        .setOptions({
            itemTemplate: (travelType: TravelType) => `${travelType.ForeignTypeID} - ${travelType.Description || travelType.ForeignDescription}`,
            lookupFunction: (query) => travelTypes$
                .filter(tt => !!tt)
                .take(1)
                .map(types => types.filter(tt =>
                    tt.ForeignTypeID.toString().startsWith(query) ||
                    (tt.Description || tt.ForeignDescription).toLowerCase().includes(query)))
        });
    }

    private getWageTypeColumn(wageTypes$: Observable<WageType[]>): UniTableColumn {
        return new UniTableColumn(WAGE_TYPE_FIELD, 'Lønnsart', UniTableColumnType.Lookup, true)
        .setTemplate((travel: TravelLine) => {
            if (!travel[WAGE_TYPE_FIELD]) {
                return '';
            }
            return `${travel[WAGE_TYPE_FIELD].WageTypeNumber} - ${travel[WAGE_TYPE_FIELD].WageTypeName}`;
        })
        .setOptions({
            itemTemplate: (selectedItem: WageType) => `${selectedItem.WageTypeNumber} - ${selectedItem.WageTypeName}`,
            lookupFunction: (query) => wageTypes$
                .filter(wt => !!wt)
                .take(1)
                .map(wageTypes => wageTypes.filter(wt =>
                    wt.WageTypeNumber.toString().startsWith(query)
                    || wt.WageTypeName.toLowerCase().includes(query)))
        });
    }

    private getFromColumn(): UniTableColumn {
        return new UniTableColumn('From', 'Fra dato', UniTableColumnType.DateTime)
        .setFormat('DD.MM.YYYY HH:mm')
        .setWidth('13rem');
    }

    private getToColumn(): UniTableColumn {
        return new UniTableColumn('To', 'Til dato', UniTableColumnType.DateTime)
            .setFormat('DD.MM.YYYY HH:mm')
            .setWidth('13rem');
    }

    private getAccountColumn(): UniTableColumn {
        return new UniTableColumn(ACCOUNT_FIELD, 'Konto (lønnsart)', UniTableColumnType.Lookup, true)
        .setTemplate((row: TravelLine) => `${row.AccountNumber || row[WAGE_TYPE_FIELD]?.AccountNumber || ''}`)
        .setOptions({
            itemTemplate: (selectedItem: Account) => {
                return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
            },
            lookupFunction: (searchValue) => {
                return this.accountService.GetAll(
                    `filter=contains(AccountName, '${searchValue}') `
                    + `or startswith(AccountNumber, '${searchValue}')&top50`
                );
            }
        });
    }

    private getInvoiceAccountColumn(): UniTableColumn {
        return new UniTableColumn(INVOICE_ACCOUNT_FIELD, 'Konto (utlegg)')
        .setTemplate((row: TravelLine) => `${row.InvoiceAccount || (row.travelType?.InvoiceAccount) || ''}`)
        .setOptions({
            itemTemplate: (item: Account) => item ? `${item.AccountNumber} - ${item.AccountName}` : '',
            lookupFunction: (query) => this.statisticsService
                .GetAllUnwrapped(
                    'select=AccountNumber as AccountNumber,AccountName as AccountName'
                    + '&model=Account'
                    + `&filter=contains(AccountName,'${query}') `
                    + `or startswith(AccountNumber,'${query}')`
                    + `&top=50`
                )
        });
    }

    private getVatTypeColumn(): UniTableColumn {
        return this.salaryTransViewService.createVatTypeColumn(true, 'From');
    }

    private getAmountColumn(): UniTableColumn {
        return new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number, true);
    }

    private getRateColumn(): UniTableColumn {
        return new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money, true);
    }

    private getSumColumn(): UniTableColumn {
        return new UniTableColumn('', 'Sum', UniTableColumnType.Money, false)
            .setTemplate((row: TravelLine) => row[IS_EMPTY_FIELD]
                ? ''
                : UniMath.useFirstTwoDecimals((row.Rate * row.Amount) || 0).toString()
            );
    }
}
