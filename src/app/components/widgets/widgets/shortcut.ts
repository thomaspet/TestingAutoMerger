import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

export interface IShortcut {
    name: string;
    link: string;
    icon: string;

}

@Component({
    selector: 'uni-shortcut',
    template: `<div *ngIf="config" class="uni-widget-shortcut-tile uni-widget-tile-content"  (click)="onClickNavigate()" >
                   <a class="{{ config.icon !== '' ? getIconClass() : 'dashboard-shortcut-icon-fallback' }}">Link</a><br />
                   <a class="uni-shortcut-link">{{ config.name }}</a>
               </div>`
})

export class UniShortcutWidget {

    @Input() private config: IShortcut;

    constructor(private Router: Router) { }

    private onClickNavigate() {
        this.Router.navigateByUrl(this.config.link);
    } 

    private getIconClass() {
        return 'dashboard-shortcut-icon dashboard-shortcut-icon-' + this.config.icon;
    }
}