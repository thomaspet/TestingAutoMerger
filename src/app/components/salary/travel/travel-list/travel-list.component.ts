import {Component, OnInit, Input, ViewChild, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges} from '@angular/core';
import {Travel, state} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType, IContextMenuItem} from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {ReplaySubject} from 'rxjs';
import {TravelService} from '@app/services/services';
import {UniModalService} from '@uni-framework/uni-modal';
import {TravelRejectModalComponent} from '@app/components/salary/travel/travel-reject-modal/travel-reject-modal.component';

const SELECTED_KEY = '_rowSelected';
const DIRTY = '_isDirty';
const PAGE_SIZE = 50;

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
    @Output() public updateListAndSave: EventEmitter<Travel[]> = new EventEmitter();
    @ViewChild(AgGridWrapper, { static: true }) public grid: AgGridWrapper;
    private grid$: ReplaySubject<AgGridWrapper> = new ReplaySubject(1);
    public busy: boolean;

    public config: UniTableConfig;
    public contextMenuItems: IContextMenuItem[] = [];
    private selected: Travel;

    constructor(
        private travelService: TravelService,
        private modalService: UniModalService
    ) {}

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

        this.contextMenuItems = [
            {
                action: (item) => this.rejectTravel(item),
                disabled: (item) => item.State >= state.Rejected,
                label: 'Avvis reise'
            }
        ];

        this.config = new UniTableConfig('salary.travel.travellist', false)
            .setMultiRowSelect(true)
            .setColumns([typeCol, nameCol, descriptionCol])
            .setPageSize(PAGE_SIZE)
            .setContextMenu(this.contextMenuItems)
            .setConditionalRowCls(row => {
                if (row[SELECTED_KEY]) {
                    return 'selected-travel';
                }
            });
    }

    public rowSelected(row: Travel) {
        this.selectedTravel.emit(row);
        this.updateSelected(row);
    }

    public selectionChanged(selection: Travel[]) {
        this.selectionChange.next(selection);
    }

    private rejectTravel(travel: Travel) {
        this.modalService
            .open(TravelRejectModalComponent, {data: travel})
            .onClose
            .subscribe((result) => {
                if (result.reject) {
                    travel.State = state.Rejected;
                    travel[DIRTY] = true;
                    travel[SELECTED_KEY] = true;
                    const indx = this.travels.findIndex(t => t.ID === travel.ID);
                    this.travels[indx] = travel;
                    this.updateListAndSave.next(this.travels);
                }
            });
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
                if (focusTravel['_originalIndex'] !== undefined) {
                    const index = focusTravel['_originalIndex'];
                    this.grid.paginationInputChange(Math.ceil((index + 1) / PAGE_SIZE));
                }
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
