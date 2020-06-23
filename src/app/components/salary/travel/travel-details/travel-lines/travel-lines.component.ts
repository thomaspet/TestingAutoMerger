import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {TravelLine, WageType, TravelType} from '@uni-entities';
import {UniTableConfig} from '@uni-framework/ui/unitable';
import {IRowChangeEvent} from '@uni-framework/ui/ag-grid/interfaces';
import {WageTypeService, TravelTypeService} from '@app/services/services';
import {BehaviorSubject, Observable} from 'rxjs';
import { tap, map } from 'rxjs/operators';
import {
    TravelLinesTableService,
    IS_EMPTY_FIELD,
    ROW_GUID_FIELD,
} from '@app/components/salary/travel/shared/services/travel-lines-table.service';
import { TravelLineTableChangeService } from '../../shared/services/travel-line-table-change.service';

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
        private travelTypeService: TravelTypeService,
        private travelLinesTableService: TravelLinesTableService,
        private travelLineTableChangeService: TravelLineTableChangeService,
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
        this.travelLinesTableService
            .getColumns(this.wageTypes$, this.travelTypes$)
            .pipe(
                map(columns => new UniTableConfig('salary.travel.traveldetails.travellines', true)
                    .setColumns(columns)
                    .setDeleteButton(true)
                    .setColumnMenuVisible(true)
                    .setChangeCallback((event: IRowChangeEvent) => this.handleChange(event)))
            )
            .subscribe(config => this.config = config);
    }

    private handleChange(event: IRowChangeEvent): Observable<TravelLine> {
        return this.travelLineTableChangeService
            .handleChange(event, this.wageTypes$)
            .pipe(
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
}
