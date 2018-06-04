import {Component, OnInit, Input, ViewChild, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges} from '@angular/core';
import {Travel} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TravelService} from '@app/services/services';
const SELECTED_KEY = '_rowSelected';
@Component({
    selector: 'uni-travel-list',
    templateUrl: './travel-list.component.html',
    styleUrls: ['./travel-list.component.sass']
})
export class TravelListComponent implements OnInit, AfterViewInit, OnChanges {

    @Input() public travels: Travel[];
    @Output() public selectedTravel: EventEmitter<Travel> = new EventEmitter();
    @Output() public updatedList: EventEmitter<Travel[]> = new EventEmitter();
    @Output() public selectionChange: EventEmitter<Travel[]> = new EventEmitter();
    @ViewChild(AgGridWrapper) public grid: AgGridWrapper;
    private grid$: ReplaySubject<AgGridWrapper> = new ReplaySubject(1);
    public busy: boolean;

    public config: UniTableConfig;

    private selected: Travel;

    constructor(private travelService: TravelService) {}

    public ngOnInit() {
        this.createConfig();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['travels']) {
            this.focus(this.travels);
        }
    }

    public ngAfterViewInit() {
        this.grid$.next(this.grid);
    }

    private createConfig() {
        const typeCol = new UniTableColumn('_costType', 'Type', UniTableColumnType.Text).setTemplate((row: Travel) => {
            return this.travelService.typeText(row['_costType']);
        });
        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);
        const descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);

        this.config = new UniTableConfig('salary.travel.travellist', false)
            .setMultiRowSelect(true)
            .setColumns([typeCol, nameCol, descriptionCol])
            .setPageSize(12)
            .setAutoScrollIfNewCellCloseToBottom(true);
    }

    public rowSelected(row: Travel) {
        this.selectedTravel.emit(row);
        this.updateSelected(row);
    }

    public selectionChanged(selection: Travel[]) {
        this.selectionChange.next(selection);
    }

    private updateSelected(row: Travel) {
        if (!this.travels || !row) {
            return;
        }
        this.travels.forEach(travel => travel[SELECTED_KEY] = travel['_originalIndex'] === row['_originalIndex']);
        this.setSelected(this.travels);
    }

    private focus(travels: Travel[]) {
        this.grid$
            .take(1)
            .subscribe(grid => this.setFocus(travels.find(x => x[SELECTED_KEY]), travels, grid));
    }

    private setFocus(focusTravel: Travel, travels: Travel[], grid: AgGridWrapper) {
        setTimeout(() => {
            if (focusTravel) {
                this.grid.focusRow(
                    focusTravel['_originalIndex'] ||
                    travels.findIndex(travel => focusTravel.ID
                        ? travel.ID === focusTravel.ID
                        : travel._createguid === focusTravel._createguid));
            }
            this.rowSelected(focusTravel);
        });
    }

    private setSelected(travels: Travel[]) {
        if (!travels || !travels.length) {
            return;
        }
        const selected = travels.find(travel => travel[SELECTED_KEY]);
        if (this.selected && this.selected['_originalIndex'] === selected['_originalIndex']) {
            return;
        }
        this.updatedList.next(travels);
        this.selected = selected;
    }

}
