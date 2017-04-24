﻿import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import {IUniWidget} from '../uniWidget';

@Component({
    selector: 'uni-shortcut',
    template: `
        <div *ngIf="widget"
             class="uni-widget-shortcut-tile uni-widget-tile-content"
             (click)="onClickNavigate()">
            <a *ngIf="widget?.config?.icon" [ngClass]="getIconClass()"></a><br />
            <a class="uni-shortcut-link">{{ widget.config.label }}</a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniShortcutWidget {
    public widget: IUniWidget;

    constructor(private router: Router) { }

    public onClickNavigate() {
        if (!this.widget._editMode) {
            this.router.navigateByUrl(this.widget.config.link);
        }
    }

    public getIconClass() {
        return 'dashboard-shortcut-icon dashboard-shortcut-icon-' + this.widget.config.icon;
    }
}
