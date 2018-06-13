import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {TravelLine, WageType} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {UniMath} from '@uni-framework/core/uniMath';
import {IRowChangeEvent} from '@uni-framework/ui/ag-grid/interfaces';
import {WageTypeService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
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

    constructor(private wageTypeService: WageTypeService) { }

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
        const amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number, false);
        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Number, false);
        const sumCol = new UniTableColumn('', 'Sum', UniTableColumnType.Number, false)
            .setTemplate((row: TravelLine) => row['_isEmpty'] ? '' : UniMath.useFirstTwoDecimals(row.Rate * row.Amount).toString());
        this.config = new UniTableConfig('salary.travel.traveldetails.travellines', true)
            .setColumns([wtCol, travelTypeCol, fromCol, toCol, amountCol, rateCol, sumCol])
            .setAutoAddNewRow(false)
            .setChangeCallback((event: IRowChangeEvent) => this.handleChange(event));
    }

    private handleChange(event: IRowChangeEvent): TravelLine {
        const line: TravelLine = event.rowModel;
        if (!line.ID) {
            return line;
        }
        if (event.field === '_wageType') {
            const wt: WageType = line['_wageType'];
            line.travelType.WageTypeNumber = wt && wt.WageTypeNumber;
            line.travelType[DIRTY] = true;
        }
        line[DIRTY] = true;
        const index = this.travelLines.findIndex(travelline => travelline.ID === line.ID);
        this.travelLines[index] = line;
        this.travelLinesUpdated.next(this.travelLines.filter(travelLine => !!travelLine.ID));
        return line;
    }



}
