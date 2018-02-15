﻿import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {WidgetDataService} from '../widgetDataService';
declare const _;

@Component({
    selector: 'uni-counter-widget',
    template: `
        <div *ngIf="widget"
             [ngClass]="widget.config.class"
             class="uni-widget-notification-tile uni-widget-tile-content"
             (click)="onClickNavigate()"
             title="{{ widget.description }}">

            <a class="{{ widget.config.icon !== '' ? getIconClass() : 'dashboard-shortcut-icon-fallback' }}">Link</a><br />
            <h2> {{count}} </h2>
            <p>{{widget.config?.label}}</p>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCounterWidget {
    @Input() private widget: IUniWidget;
    private count: number = 0;

    constructor(
        private router: Router,
        private widgetDataService: WidgetDataService,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {
        if (this.widget) {
            const config = this.widget.config;
            this.widgetDataService.getData(config.dataEndpoint).subscribe(
                res => {
                    if (config.valueKey) {
                        this.count = _.get(res, config.valueKey) || 0;
                        this.cdr.markForCheck();
                    } else if (typeof res === 'number') {
                        this.count = res;
                        this.cdr.markForCheck();
                    }
                },
                err => {}
            );
        }
    }

    public onClickNavigate() {
        if (!this.widget._editMode) {
            this.router.navigateByUrl(this.widget.config.link);
        }
    }

    public getIconClass() {
        return 'dashboard-notification-icon dashboard-notification-icon-' + this.widget.config.icon;
    }
}
