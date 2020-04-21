import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {TravelLine, WageType, Account, TravelType} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {UniMath} from '@uni-framework/core/uniMath';
import {IRowChangeEvent} from '@uni-framework/ui/ag-grid/interfaces';
import {WageTypeService, AccountService, TravelTypeService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import {TravelLineService} from '@app/services/salary/travel/travelLineService';
import {SalaryTransViewService} from '@app/components/salary/shared/services/salaryTransViewService';
const DIRTY = '_isDirty';

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

        this.createConfig();
    }

    private createConfig() {
        const wtCol = new UniTableColumn('_wageType', 'Lønnsart', UniTableColumnType.Lookup, (row: TravelLine) => row && !!row.travelType)
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
        const ttCol = new UniTableColumn('travelType', 'Reisetype', UniTableColumnType.Lookup)
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

        const fromCol = new UniTableColumn('From', 'Fra dato', UniTableColumnType.DateTime, false).setFormat('DD.MM.YYYY HH:mm')
            .setWidth('13rem');
        const toCol = new UniTableColumn('To', 'Til dato', UniTableColumnType.DateTime, false).setFormat('DD.MM.YYYY HH:mm')
            .setWidth('13rem');
        const accountCol = new UniTableColumn('_Account', 'Konto', UniTableColumnType.Lookup, true)
            .setTemplate((line: TravelLine) => {
                return `${line.AccountNumber || ''}`;
            })
            .setOptions({
                itemTemplate: (selectedItem: Account) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this.accountService.GetAll(
                        `filter=contains(AccountName, '${searchValue}') `
                        + `or startswith(AccountNumber, '${searchValue}')&top50`
                    ).debounceTime(200);
                }
            });
        const vatTypeCol = this.salaryTransViewService.createVatTypeColumn(true, 'From');
        const amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Money, false);
        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money, false);
        const sumCol = new UniTableColumn('', 'Sum', UniTableColumnType.Money, false)
            .setTemplate((row: TravelLine) => row['_isEmpty'] ? '' : UniMath.useFirstTwoDecimals(row.Rate * row.Amount).toString());
        this.config = new UniTableConfig('salary.travel.traveldetails.travellines', true)
            .setColumns([wtCol, ttCol, fromCol, toCol, accountCol, vatTypeCol, amountCol, rateCol, sumCol])
            .setAutoAddNewRow(false)
            .setColumnMenuVisible(true)
            .setChangeCallback((event: IRowChangeEvent) => this.handleChange(event));
    }

    private handleChange(event: IRowChangeEvent): Observable<TravelLine> {
        if (!event.rowModel.ID) {
            return Observable.of(event.rowModel);
        }

        return Observable
            .of(<TravelLine>event.rowModel)
            .map(line => {
                line[DIRTY] = true;
                if (event.field === '_wageType' || event.field === 'travelType') {
                    line.travelType[DIRTY] = true;
                }
                return line;
            })
            .map(line => {
                if (event.field === '_Account') {
                    this.mapAccountToTravelLine(line);
                }
                if (event.field === 'travelType') {
                    this.mapTravelTypeToTravelLine(line);
                }
                if (event.field === '_wageType') {
                    this.mapWageTypeToTravelLine(line);
                }
                if (event.field === 'VatType') {
                    line.VatTypeID = line.VatType && line.VatType.ID;
                }
                return line;
            })
            .switchMap(line => {
                if (event.field === '_wageType' || event.field === '_Account' || event.field === 'travelType') {
                    return this.travelLineService.suggestVatType(line);
                }
                return Observable.of(line);
            })
            .do(line => {
                const index = this.travelLines.findIndex(travelline => travelline.ID === line.ID);
                this.travelLines[index] = line;
                this.travelLinesUpdated.next(this.travelLines.filter(travelLine => !!travelLine.ID));
            });
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
