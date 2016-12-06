import {Component, Input} from '@angular/core';

export interface IAlertsWidgetConfig {
    alerts: {
        text: string;
        class?: string;
        timestamp?: string;
        onClick?: any;
    }[];
}

@Component({
    selector: 'uni-widget-alerts',
    template: `
        <ul>
            <li *ngFor="let alert of config.alerts"
                [ngClass]="alert.class"
                [attr.role]="alert.onClick ? 'button' : 'status'"
                (click)="handleClick(alert.onClick)">
                    {{alert.text}}
                    <time *ngIf="alert.timestamp">{{alert.timestamp}}</time>
            </li>
        </ul>
    `
})
export class AlertsWidget {
    @Input() public config: IAlertsWidgetConfig;

    public handleClick(callback) {
        return callback ? callback() : false;
    }
}
