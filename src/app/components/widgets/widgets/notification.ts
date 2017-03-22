import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

export interface INotification {
    backgroundColor: string;
    icon: string;
    ammount: string;
    title: string;
    link: string;
    name: string;
}

@Component({
    selector: 'uni-notification',
    template: `<div *ngIf="config" [ngStyle]="{'background-color': config.backgroundColor}" class="uni-widget-notification-tile uni-widget-tile-content"  (click)="onClickNavigate()" title="{{ config.title }}" >
                    <a class="{{ config.icon !== '' ? getIconClass() : 'dashboard-shortcut-icon-fallback' }}">Link</a><br />
                    <h2> {{ config.ammount }} </h2>
                    <p>{{ config.name }}</p>
               </div>`
})

export class UniNotificationWidget {

    @Input() private config: INotification;

    constructor(private Router: Router) { }

    private onClickNavigate() {
        this.Router.navigateByUrl(this.config.link);
    }

    private getIconClass() {
        return 'dashboard-notification-icon dashboard-notification-icon-' + this.config.icon;
    }
}