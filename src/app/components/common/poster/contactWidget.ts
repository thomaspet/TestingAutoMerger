import {Component, Input} from '@angular/core';

export interface IContactWidgetConfig {
    avatar?: string;
    name?: string;
    contacts?: {
        value: string;
        label?: string;
        class?: string;
    }[];
}

@Component({
    selector: 'uni-widget-contact',
    template: `
        <div *ngIf="!config.avatar" class="withoutAvatar" aria-role="presentation"></div>
        <img *ngIf="config.avatar" [src]="config.avatar" [alt]="config.name ? config.name + '&#8217;s avatar' : 'Contact avatar'" />
        <h1 *ngIf="config.name">{{config.name}}</h1>
        <ul>
            <li *ngFor="let contact of config.contacts" [ngClass]="contact.class">{{contact.label ? contact.label + ': ' : ''}}{{contact.value}}</li>
        </ul>
    `
})
export class ContactWidget {
    @Input() public config: IContactWidgetConfig;
}
