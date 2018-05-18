import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Eventplan } from '@app/unientities';
import { UniTableConfig } from '@uni-framework/ui/unitable';
import tableConfig from './table.config';

@Component({
    selector: 'event-plans-list',
    templateUrl: './event-plans-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventPlansList {
    @Input() data: Eventplan[];
    @Output() eventplanSelected: EventEmitter<Eventplan> = new EventEmitter<Eventplan>(true);
    @Output() eventplanDeleted: EventEmitter<Eventplan> = new EventEmitter<Eventplan>(true);

    config: UniTableConfig;

    constructor() {
        this.config = tableConfig;
    }

    onRowSelected(row) {
        this.eventplanSelected.emit(row);
    }

    onRowDelete($event) {
        this.eventplanDeleted.emit($event);
    }
}
