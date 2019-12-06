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

        // const element = document.createElement('span');
        // element.classList.add('status-cell');

        // let status;
        // if (col.statusMap) {
        //     if (params.value) {
        //         status = col.statusMap[params.value] || status;

        //         if (status && status.tooltip) {
        //             element.title = status.tooltip(params.node.data);
        //             console.log('setting title to', element.title);
        //         }

        //     } else if (col.statusMap[0]) {
        //         status = col.statusMap[0];
        //     }
        // }

        // status = status || params.value || 'Ingen status';

        // if (typeof status === 'string') {
        //     element.innerText = status;
        //     element.title = status;
        //     element.classList.add('info');
        // } else {
        //     element.innerText = status.label;
        //     element.title = status.label;
        //     element.classList.add(status.class || 'info');
        // }
    }

    refresh(): boolean {
        return false;
    }
}
