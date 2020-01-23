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
    @Output() costAllocationSelected: EventEmitter<{row: CostAllocation, index: number}> = new EventEmitter<{row: CostAllocation, index: number}>(true);
    @Output() costAllocationDeleted: EventEmitter<CostAllocation> = new EventEmitter<CostAllocation>(true);

    @ViewChild('table', { static: true }) table: AgGridWrapper;
    config: UniTableConfig;

    constructor() {
        this.config = tableConfig;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.selectedIndex >= 0) {
            setTimeout(() => this.table.focusRow(this.selectedIndex), 200);
        } else {
            setTimeout(() => {
                if (this.table && this.table.getRowCount() > 0) {
                    this.table.clearSelection();
                }
            });
        }
    }

    onRowSelected(row) {
        const index = this.data.findIndex(item => row.ID === item.ID);
        this.costAllocationSelected.emit({row, index});
    }

    onRowDelete($event) {
        this.costAllocationDeleted.emit($event);
    }
}
