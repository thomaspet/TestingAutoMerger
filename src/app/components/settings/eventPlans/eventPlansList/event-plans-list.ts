import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges,
    ViewChild
} from '@angular/core';
import { Eventplan } from '@app/unientities';
import { UniTableConfig } from '@uni-framework/ui/unitable';
import tableConfig from './table.config';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'event-plans-list',
    templateUrl: './event-plans-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventPlansList {
    @Input() data: Eventplan[];
    @Input() selectedIndex: number;
    @Output() eventplanSelected: EventEmitter<Eventplan> = new EventEmitter<Eventplan>(true);
    @Output() eventplanDeleted: EventEmitter<Eventplan> = new EventEmitter<Eventplan>(true);

    @ViewChild('table', { static: true }) table: AgGridWrapper;
    config: UniTableConfig;

    constructor() {
        this.config = tableConfig;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.selectedIndex && changes.selectedIndex.currentValue !== changes.selectedIndex.previousValue) {
            this.eventplanSelected.emit(this.data[this.selectedIndex]);
            setTimeout(() => this.table.focusRow(this.selectedIndex), 200);
        }
    }

    onRowSelected(row) {
        this.eventplanSelected.emit(row);
    }

    onRowDelete($event) {
        this.eventplanDeleted.emit($event);
    }
}
