import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {TravelLine, WageType, Account, TravelType, Travel} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {UniMath} from '@uni-framework/core/uniMath';
import {IRowChangeEvent} from '@uni-framework/ui/ag-grid/interfaces';
import {WageTypeService, AccountService, TravelTypeService} from '@app/services/services';
import {BehaviorSubject, of, Observable} from 'rxjs';
import {TravelLineService} from '@app/services/salary/travel/travelLineService';
import {SalaryTransViewService} from '@app/components/salary/shared/services/salaryTransViewService';
import { tap, map, switchMap } from 'rxjs/operators';

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
        this.travelLinesUpdated.next(this.travelLines.filter(x => (!(x['_isEmpty'] === true) || x === event)));
    }

    private createTable() {
        const wageTypeColumn = new UniTableColumn('_wageType', 'Lønnsart', UniTableColumnType.Lookup, true)
            .setTemplate((travel: TravelLine) => {
                if (!travel['_wageType']) {
                    return '';
                }
                return `${travel['_wageType'].WageTypeNumber} - ${travel['_wageType'].WageTypeName}`;
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

        const travelTypeColumn = new UniTableColumn('travelType', 'Reisetype', UniTableColumnType.Lookup)
            .setVisible(false)
            .setTemplate((travel: TravelLine) => {
                if (!travel.travelType) {
                    return '';
                }
                return `${travel.travelType.ID} - ${travel.travelType.Description || travel.travelType.ForeignDescription}`;
            })
            .setOptions({
                itemTemplate: (travelType: TravelType) => `${travelType.ID} - ${travelType.Description || travelType.ForeignDescription}`,
                lookupFunction: (query) => this.travelTypes$
                    .filter(tt => !!tt)
                    .take(1)
                    .map(types => types.filter(tt =>
                        tt.ID.toString().startsWith(query) ||
                        (tt.Description || tt.ForeignDescription).toLowerCase().includes(query)))
            });

        const fromColumn = new UniTableColumn('From', 'Fra dato', UniTableColumnType.DateTime)
            .setFormat('DD.MM.YYYY HH:mm')
            .setWidth('13rem');
        const toColumn = new UniTableColumn('To', 'Til dato', UniTableColumnType.DateTime).setFormat('DD.MM.YYYY HH:mm')
            .setWidth('13rem');
        const accountColumn = new UniTableColumn('_Account', 'Konto', UniTableColumnType.Lookup, true)
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
        const vatTypeColumn = this.salaryTransViewService.createVatTypeColumn(true, 'From');
        const amountColumn = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number, true);
        const rateColumn = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money, true);
        const sumColumn = new UniTableColumn('', 'Sum', UniTableColumnType.Money, false)
            .setTemplate((row: TravelLine) => row['_isEmpty'] ? '0' : UniMath.useFirstTwoDecimals((row.Rate * row.Amount) || 0).toString());

        this.config = new UniTableConfig('salary.travel.traveldetails.travellines', true)
            .setDefaultRowData(
                {
                    _createguid: this.travelLineService.getNewGuid()
                })
            .setColumns(
                [travelTypeColumn, wageTypeColumn, fromColumn, toColumn, accountColumn, vatTypeColumn, amountColumn, rateColumn, sumColumn]
                )
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

                if (event.field === '_Account') {
                    this.mapAccountToTravelLine(travelLine);
                }
                if (event.field === 'travelType') {
                    this.mapTravelTypeToTravelLine(travelLine);
                }
                if (event.field === '_wageType') {
                    this.mapWageTypeToTravelLine(travelLine);
                }
                if (event.field === 'VatType') {
                    travelLine.VatTypeID = travelLine.VatType && travelLine.VatType.ID;
                }
                return travelLine;
            }),
            switchMap(travelLine => {
                if ((event.field === '_wageType' || event.field === '_Account' || event.field === 'travelType') && !!travelLine.From) {
                    return this.travelLineService.suggestVatType(travelLine);
                }
                return of(travelLine);
            }),
            tap(travelLine => {
                if (!this.travelLines.length) {
                    this.travelLines.push(travelLine);
                }

                this.travelLines = this.travelLines.map(x => {
                    if (x['_guid'] === travelLine['_guid']) {
                        return travelLine;
                    }
                    return x;
                });

                this.travelLinesUpdated.next(this.travelLines.filter(x => !(x['_isEmpty'] === true)));
            })
        );
    }


    private mapTravelTypeToTravelLine(travelLine: TravelLine): TravelLine {
        const wts = this.wageTypes$.getValue();
        travelLine['_wageType'] = wts && wts.find(wt => wt.WageTypeNumber === travelLine.travelType.WageTypeNumber);
        travelLine.Description = travelLine.Description || travelLine.travelType.ForeignDescription;
        if (travelLine['_wageType']) {
            this.mapWageTypeToTravelLine(travelLine);
        }
        return travelLine;
    }

    private mapWageTypeToTravelLine(line: TravelLine): TravelLine {
        const wt: WageType = line['_wageType'];
        line.travelType.WageTypeNumber = wt && wt.WageTypeNumber;
        line.AccountNumber = wt && wt.AccountNumber;

        return line;
    }

    private mapAccountToTravelLine(travelLine: TravelLine): TravelLine {
        if (!travelLine['_Account']) {
            return travelLine;
        }
        travelLine.AccountNumber = travelLine['_Account'].AccountNumber;

        return travelLine;
    }

}
