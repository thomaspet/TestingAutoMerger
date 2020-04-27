import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';
import {UniTableColumn} from '@uni-framework/ui/unitable';

@Component({
    selector: 'status-cell',
    template: `<span class="status" [ngClass]="class" [matTooltip]="tooltip">{{text}}</span>`,
    styleUrls: ['./status-cell.sass']
})
export class StatusCellRenderer implements ICellRendererAngularComp {
    params: ICellRendererParams;

    text: string;
    class: string;
    tooltip: string;

    agInit(params: ICellRendererParams): void {
        this.params = params;

        const column: UniTableColumn = params.colDef && params.colDef['_uniTableColumn'];
        if (column && column.statusMap) {
            let status;
            if (params.value) {
                status = column.statusMap[params.value] || 'Ingen status';
            } else if (column.statusMap[0]) {
                status = column.statusMap[0];
            } else {
                status = 'Ingen status';
            }

            if (typeof status === 'string') {
                this.text = status;
                this.class = 'info';
            } else {
                this.text = status.label;
                this.class = status.class || 'info';
                if (status.tooltip) {
                    this.tooltip = status.tooltip(params.node.data);
                }
            }
        }
    }

    refresh(): boolean {
        return false;
    }
}
