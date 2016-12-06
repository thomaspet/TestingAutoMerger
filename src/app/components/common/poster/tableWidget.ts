import {Component, Input} from '@angular/core';

export interface ITableWidgetRow {
    rows: {
        cells: {
            text: string;
            header?: boolean;
            colspan?: number;
        }[];
    }[];
};

@Component({
    selector: 'uni-widget-table',
    template: `
        <table>
            <tr *ngFor="let row of config.rows">
                <template ngFor let-cell [ngForOf]="row.cells">
                    <th *ngIf="cell.header" [attr.colspan]="cell.colspan || 1">{{cell.text}}</th> 
                    <td *ngIf="!cell.header" [attr.colspan]="cell.colspan || 1">{{cell.text}}</td> 
                </template>
            </tr>
        </table>
    `
})
export class TableWidget {
    @Input() public config: ITableWidgetRow[];
}
