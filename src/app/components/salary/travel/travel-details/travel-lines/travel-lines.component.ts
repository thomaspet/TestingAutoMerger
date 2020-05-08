import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {TravelLine, WageType, Account, TravelType, Travel} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {UniMath} from '@uni-framework/core/uniMath';
import {IRowChangeEvent} from '@uni-framework/ui/ag-grid/interfaces';
import {WageTypeService, AccountService, TravelTypeService, StatisticsService} from '@app/services/services';
import {BehaviorSubject, of, Observable} from 'rxjs';
import {TravelLineService} from '@app/services/salary/travel/travelLineService';
import {SalaryTransViewService} from '@app/components/salary/shared/services/salaryTransViewService';
import { tap, map, switchMap } from 'rxjs/operators';

const INVOICE_ACCOUNT_FIELD = '_InvoiceAccount';
const ACCOUNT_FIELD = '_Account';
const TRAVEL_TYPE_FIELD = 'travelType';
const WAGE_TYPE_FIELD = '_wageType';
const VAT_TYPE_FIELD = 'VatType';
const ROW_GUID_FIELD = '_guid';
const IS_EMPTY_FIELD = '_isEmpty';

@Component({
    selector: 'uni-travel-lines',
    templateUrl: './travel-lines.component.html',
    styleUrls: ['./travel-lines.component.sass']
})
export class TravelLinesComponent implements OnInit {
    @Input() public travelLines: TravelLine[] = [];
    @Output() public travelLinesUpdated: EventEmitter<TravelLine[]> = new EventEmitter();
    private wageTypes$: BehaviorSubject<WageType[]> = new BehaviorSubject(null);
    private travelTypes$: BehaviorSubject<TravelType[]> = new BehaviorSubject(null);
    public config: UniTableConfig;

    constructor(
        private wageTypeService: WageTypeService,
        private travelLineService: TravelLineService,
        private salaryTransViewService: SalaryTransViewService,
        private accountService: AccountService,
        private travelTypeService: TravelTypeService,
        private statisticsService: StatisticsService,
    ) { }

    ngOnInit() {
        this.wageTypeService
            .GetAll('')
            .subscribe(wt => this.wageTypes$.next(wt));

        this.travelTypeService
            .GetAll('')
            .subscribe(tt => this.travelTypes$.next(tt));

        this.createTable();
    }


    public onRowDelete(event) {
        this.travelLinesUpdated.next(this.travelLines.filter(x => (!(x[IS_EMPTY_FIELD] === true) || x === event)));
    }

    private createTable() {
        const wageTypeColumn = new UniTableColumn(WAGE_TYPE_FIELD, 'Lønnsart', UniTableColumnType.Lookup, true)
            .setTemplate((travel: TravelLine) => {
                if (!travel[WAGE_TYPE_FIELD]) {
                    return '';
                }
                return `${travel[WAGE_TYPE_FIELD].WageTypeNumber} - ${travel[WAGE_TYPE_FIELD].WageTypeName}`;
            })
            .setOptions({
                itemTemplate: (selectedItem: WageType) => `${selectedItem.WageTypeNumber} - ${selectedItem.WageTypeName}`,
                lookupFunction: (query) => this.wageTypes$
                    .filter(wt => !!wt)
                    .take(1)
                    .map(wageTypes => wageTypes.filter(wt =>
                        wt.WageTypeNumber.toString().startsWith(query)
                        || wt.WageTypeName.toLowerCase().includes(query)))
            });

        const travelTypeColumn = new UniTableColumn(TRAVEL_TYPE_FIELD, 'Reisetype', UniTableColumnType.Lookup)
            .setVisible(false)
            .setTemplate((travel: TravelLine) => {
                if (!travel.travelType) {
                    return '';
                }
                return `${travel.travelType.ForeignTypeID} - ${travel.travelType.Description || travel.travelType.ForeignDescription}`;
            })
            .setOptions({
                itemTemplate: (travelType: TravelType) => `${travelType.ForeignTypeID} - ${travelType.Description || travelType.ForeignDescription}`,
                lookupFunction: (query) => this.travelTypes$
                    .filter(tt => !!tt)
                    .take(1)
                    .map(types => types.filter(tt =>
                        tt.ForeignTypeID.toString().startsWith(query) ||
                        (tt.Description || tt.ForeignDescription).toLowerCase().includes(query)))
            });

        const fromColumn = new UniTableColumn('From', 'Fra dato', UniTableColumnType.DateTime)
            .setFormat('DD.MM.YYYY HH:mm')
            .setWidth('13rem');
        const toColumn = new UniTableColumn('To', 'Til dato', UniTableColumnType.DateTime).setFormat('DD.MM.YYYY HH:mm')
            .setWidth('13rem');
        const accountColumn = new UniTableColumn(ACCOUNT_FIELD, 'Konto (lønnsart)', UniTableColumnType.Lookup, true)
            .setDisplayField('AccountNumber')
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
        const invoiceAccount = new UniTableColumn(INVOICE_ACCOUNT_FIELD, 'Konto (utlegg)')
            .setDisplayField('InvoiceAccount')
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
        const vatTypeColumn = this.salaryTransViewService.createVatTypeColumn(true, 'From');
        const amountColumn = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number, true);
        const rateColumn = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money, true);
        const sumColumn = new UniTableColumn('', 'Sum', UniTableColumnType.Money, false)
            .setTemplate((row: TravelLine) => row[IS_EMPTY_FIELD] ? '0' : UniMath.useFirstTwoDecimals((row.Rate * row.Amount) || 0).toString());

        this.config = new UniTableConfig('salary.travel.traveldetails.travellines', true)
            .setDefaultRowData(
                {
                    _createguid: this.travelLineService.getNewGuid()
                })
            .setColumns(
                [
                    travelTypeColumn,
                    wageTypeColumn,
                    fromColumn,
                    toColumn,
                    accountColumn,
                    invoiceAccount,
                    vatTypeColumn,
                    amountColumn,
                    rateColumn,
                    sumColumn
                ])
            .setDeleteButton(true)
            .setColumnMenuVisible(true)
            .setChangeCallback((event: IRowChangeEvent) => this.handleChange(event));
    }

    private handleChange(event: IRowChangeEvent): Observable<TravelLine> {
        return Observable.of(event.rowModel).pipe(
            map(travelLine => {
                if (!travelLine.From) {
                    travelLine.From = new Date();
                }

                if (event.field === ACCOUNT_FIELD) {
                    this.mapAccountToTravelLine(travelLine);
                }
                if (event.field === INVOICE_ACCOUNT_FIELD) {
                    this.mapInvoiceAccountToTravelLine(travelLine);
                }
                if (event.field === TRAVEL_TYPE_FIELD) {
                    this.mapTravelTypeToTravelLine(travelLine);
                }
                if (event.field === WAGE_TYPE_FIELD) {
                    this.mapWageTypeToTravelLine(travelLine);
                }
                if (event.field === VAT_TYPE_FIELD) {
                    travelLine.VatTypeID = travelLine.VatType && travelLine.VatType.ID;
                }
                return travelLine;
            }),
            switchMap(travelLine => {
                if ((
                        event.field === WAGE_TYPE_FIELD
                        || event.field === ACCOUNT_FIELD
                        || event.field === TRAVEL_TYPE_FIELD
                    )
                    && !!travelLine.From) {
                    return this.travelLineService.suggestVatType(travelLine);
                }
                return of(travelLine);
            }),
            tap(travelLine => {
                if (!this.travelLines.length) {
                    this.travelLines.push(travelLine);
                }

                this.travelLines = this.travelLines.map(x => {
                    if (x[ROW_GUID_FIELD] === travelLine[ROW_GUID_FIELD]) {
                        return travelLine;
                    }
                    return x;
                });

                this.travelLinesUpdated.next(this.travelLines.filter(x => !(x[IS_EMPTY_FIELD] === true)));
            })
        );
    }


    private mapTravelTypeToTravelLine(travelLine: TravelLine): TravelLine {
        const wts = this.wageTypes$.getValue();
        const travelType = travelLine.travelType;
        travelLine[WAGE_TYPE_FIELD] = wts && wts.find(wt => wt.WageTypeNumber === travelType.WageTypeNumber);
        travelLine.Description = travelLine.Description || travelType.ForeignDescription;
        travelLine.InvoiceAccount = travelType.InvoiceAccount;
        if (travelLine[WAGE_TYPE_FIELD]) {
            this.mapWageTypeToTravelLine(travelLine);
        }
        return travelLine;
    }

    private mapWageTypeToTravelLine(line: TravelLine): TravelLine {
        const wt: WageType = line[WAGE_TYPE_FIELD];
        line.travelType.WageTypeNumber = wt && wt.WageTypeNumber;
        line.AccountNumber = wt && wt.AccountNumber;

        return line;
    }

    private mapAccountToTravelLine(travelLine: TravelLine): TravelLine {
        if (!travelLine[ACCOUNT_FIELD]) {
            return travelLine;
        }
        travelLine.AccountNumber = travelLine[ACCOUNT_FIELD].AccountNumber;

        return travelLine;
    }

    private mapInvoiceAccountToTravelLine(travelLine: TravelLine): TravelLine {
        if (!travelLine[INVOICE_ACCOUNT_FIELD]) { return travelLine; }
        travelLine.InvoiceAccount = travelLine[INVOICE_ACCOUNT_FIELD].AccountNumber;
        return travelLine;
    }

}
