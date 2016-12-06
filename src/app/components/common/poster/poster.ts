import {Component, Input} from '@angular/core';

export * from './textWidget';
export * from './contactWidget';
export * from './tableWidget';
export * from './alertsWidget';

export interface IPosterWidget {
    type: string;
    size?: string;
    config: any;
};

@Component({
    selector: 'uni-poster',
    template: `
    <article class="widget"
        *ngFor="let widget of widgets"
        [ngClass]="widget?.size">

        <uni-widget-text    *ngIf="widget.type === 'text'"    [config]="widget.config"></uni-widget-text>
        <uni-widget-contact *ngIf="widget.type === 'contact'" [config]="widget.config"></uni-widget-contact>
        <uni-widget-table   *ngIf="widget.type === 'table'"   [config]="widget.config"></uni-widget-table>
        <uni-widget-alerts  *ngIf="widget.type === 'alerts'"  [config]="widget.config"></uni-widget-alerts>

    </article>
    `
})
export class UniPoster {
    @Input() public widgets: IPosterWidget[];
}
