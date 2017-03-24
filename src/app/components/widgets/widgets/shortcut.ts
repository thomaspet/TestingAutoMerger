import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'uni-shortcut',
    template: `<div *ngIf="config" class="uni-widget-shortcut-tile uni-widget-tile-content"  (click)="onClickNavigate()" >
                   <a class="{{ config.icon !== '' ? getIconClass() : 'dashboard-shortcut-icon-fallback' }}">Link</a><br />
                   <a class="uni-shortcut-link">{{ config.label }}</a>
               </div>`
})

export class UniShortcutWidget {

    @Input() private config: any;

    constructor(private Router: Router) { }

    private onClickNavigate() {
        // this.Router.navigateByUrl(this.config.link);
    }

    private getIconClass() {
        return 'dashboard-shortcut-icon dashboard-shortcut-icon-' + this.config.icon;
    }
}