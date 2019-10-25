import {Component, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {WidgetDataService} from '../widgetDataService';
import {IUniWidget} from '../uniWidget';
import {NumberFormat} from '@app/services/services';
import {Router} from '@angular/router';

@Component({
    selector: 'uni-sum-widget',
    template: `
        <div class="sum_widget" [ngClass]="widget.config.class" (click)="onClickNavigate()" title="{{ widget.description }}">
            <div class="numbers-section">
                <div class="header">{{ widget.config.title}}</div>
                <div>{{ displayValue }}</div>
            </div>

            <i class="material-icons"> {{ widget.config.icon }} </i>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UniSumWidget implements AfterViewInit {
    public widget: IUniWidget;
    public displayValue: any = '0';

    constructor(
        private widgetDataService: WidgetDataService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private numberFormatSerivce: NumberFormat
    ) {}

    public ngAfterViewInit() {
        if ((this.widget && this.widget.permissions && this.widget.permissions[0]
            && this.widgetDataService.hasAccess(this.widget.permissions[0]) || !this.widget.permissions)) {
            this.widgetDataService.getData(this.widget.config.dataEndpoint)
            .subscribe(
                (res) => {
                    if (typeof res === 'number') {
                        this.displayValue = res;
                    } else if (this.widget.config.useLength) {
                        if (res && res.Data) {
                            this.displayValue = res.Data.length;
                        }
                    } else {
                        if (!res || !res.Data) {
                            return;
                        }
                        const sum = res.Data[0] && (res.Data[0].sum || 0);
                        if (this.widget.config.positive && sum === 0) {
                            this.widget.config.icon = this.widget.config.goodIcon ? this.widget.config.goodIcon : this.widget.config.icon;
                            this.widget.config.class = this.widget.config.goodClass
                                ? this.widget.config.goodClass : this.widget.config.class;
                        }
                        this.displayValue = this.numberFormatSerivce.asMoney(sum, { decimalLength: 0 });
                    }
                    this.cdr.markForCheck();
                }, err => {}
            );
        }
    }

    public onClickNavigate() {
        if (this.widget && !this.widget._editMode) {
            if (this.widget.config.link.includes('<userID>')) {
                this.router.navigateByUrl(this.widgetDataService.replaceWithUserID(this.widget.config.link));
            } else {
                this.router.navigateByUrl(this.widget.config.link);
            }
        }
    }
}
