import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'uni-notification',
    template: `<div *ngIf="config" [ngStyle]="{'background-color': config.backgroundColor}" class="uni-widget-notification-tile uni-widget-tile-content"  (click)="onClickNavigate()" title="{{ config.description }}" >
                    <a class="{{ config.icon !== '' ? getIconClass() : 'dashboard-shortcut-icon-fallback' }}">Link</a><br />
                    <h2> {{ config.amount }} </h2>
                    <p>{{ config.label }}</p>
               </div>`
})

export class UniNotificationWidget {

    @Input() private config: any;

    constructor(private Router: Router) { }

    private onClickNavigate() {
        this.Router.navigateByUrl(this.config.link);
    }

    private getIconClass() {
        return 'dashboard-notification-icon dashboard-notification-icon-' + this.config.icon;
    }
}