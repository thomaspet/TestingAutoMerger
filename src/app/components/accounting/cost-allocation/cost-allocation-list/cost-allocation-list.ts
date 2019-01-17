import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges,
    ViewChild
} from '@angular/core';
import { CostAllocation } from '@app/unientities';
import { UniTableConfig } from '@uni-framework/ui/unitable';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import tableConfig from './cost-allocation-table.config';

@Component({
    selector: 'uni-cost-allocation-list',
    templateUrl: './cost-allocation-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCostAllocationList {
    @Input() data: CostAllocation[];
    @Input() selectedIndex: number;
    @Output() costAllocationSelected: EventEmitter<CostAllocation> = new EventEmitter<CostAllocation>(true);
    @Output() costAllocationDeleted: EventEmitter<CostAllocation> = new EventEmitter<CostAllocation>(true);

    @ViewChild('table') table: AgGridWrapper;
    config: UniTableConfig;

    constructor() {
        this.config = tableConfig;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.selectedIndex && changes.selectedIndex.currentValue !== changes.selectedIndex.previousValue) {
            this.costAllocationSelected.emit(this.data && this.data[this.selectedIndex]);
            setTimeout(() => this.table.focusRow(this.selectedIndex), 200);
        }
    }

    onRowSelected(row) {
        this.costAllocationSelected.emit(row);
    }

    onRowDelete($event) {
        this.costAllocationDeleted.emit($event);
    }
}
