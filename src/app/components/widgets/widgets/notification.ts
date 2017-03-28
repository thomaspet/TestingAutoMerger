import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import {IUniWidget} from '../uniWidget';

@Component({
    selector: 'uni-notification',
    template: `
        <div *ngIf="widget"
             [ngClass]="widget.config.class"
             class="uni-widget-notification-tile uni-widget-tile-content"
             (click)="onClickNavigate()"
             title="{{ widget.config.description }}">

            <a class="{{ widget.config.icon !== '' ? getIconClass() : 'dashboard-shortcut-icon-fallback' }}">Link</a><br />
            <h2> {{ widget.config.amount }} </h2>
            <p>{{ widget.config.label }}</p>
        </div>`
})
export class UniNotificationWidget {
    @Input() private widget: IUniWidget;

    constructor(private router: Router) { }

    public onClickNavigate() {
        if (!this.widget.dragMode) {
            this.router.navigateByUrl(this.widget.config.link);
        }
    }

    public getIconClass() {
        return 'dashboard-notification-icon dashboard-notification-icon-' + this.widget.config.icon;
    }
}
