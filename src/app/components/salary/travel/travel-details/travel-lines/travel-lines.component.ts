import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {TravelLine, WageType, Account} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {UniMath} from '@uni-framework/core/uniMath';
import {IRowChangeEvent} from '@uni-framework/ui/ag-grid/interfaces';
import {WageTypeService, AccountService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {TravelLineService} from '@app/services/salary/travel/travelLineService';
import {SalaryTransViewService} from '@app/components/salary/sharedServices/salaryTransViewService';
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
    public config: UniTableConfig;

    constructor(
        private wageTypeService: WageTypeService,
        private travelLineService: TravelLineService,
        private salaryTransViewService: SalaryTransViewService,
        private accountService: AccountService,
    ) { }

    ngOnInit() {
        this.wageTypeService
            .GetAll('')
            .subscribe(wt => this.wageTypes$.next(wt));

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
        const travelTypeCol = new UniTableColumn('Description', 'Reisetypenavn', UniTableColumnType.Text, false);
        const fromCol = new UniTableColumn('From', 'Fra dato', UniTableColumnType.DateTime, false).setFormat('DD.MM.YYYY HH:mm');
        const toCol = new UniTableColumn('To', 'Til dato', UniTableColumnType.DateTime, false).setFormat('DD.MM.YYYY HH:mm');
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
        const amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number, false);
        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Number, false);
        const sumCol = new UniTableColumn('', 'Sum', UniTableColumnType.Number, false)
            .setTemplate((row: TravelLine) => row['_isEmpty'] ? '' : UniMath.useFirstTwoDecimals(row.Rate * row.Amount).toString());
        this.config = new UniTableConfig('salary.travel.traveldetails.travellines', true)
            .setColumns([wtCol, travelTypeCol, fromCol, toCol, accountCol, vatTypeCol, amountCol, rateCol, sumCol])
            .setAutoAddNewRow(false)
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
                return line;
            })
            .map(line => {
                if (event.field === '_Account') {
                    this.mapAccountToTravelLine(line);
                }
                if (event.field === '_wageType') {
                    const wt: WageType = line['_wageType'];
                    line.travelType.WageTypeNumber = wt && wt.WageTypeNumber;
                    line.travelType[DIRTY] = true;
                    line.AccountNumber = wt && wt.AccountNumber;
                }
                if (event.field === 'VatType') {
                    line.VatTypeID = line.VatType && line.VatType.ID;
                }
                return line;
            })
            .switchMap(line => {
                if (event.field === '_wageType' || event.field === '_Account') {
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

    private mapAccountToTravelLine(travelLine: TravelLine) {
        if (!travelLine['_Account']) {
            return travelLine;
        }

        travelLine.AccountNumber = travelLine['_Account'].AccountNumber;

        return travelLine;
    }

}
