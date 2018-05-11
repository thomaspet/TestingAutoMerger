import {Component, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {WidgetDataService} from '../widgetDataService';
import {IUniWidget} from '../uniWidget';
import {Router} from '@angular/router';

@Component({
    selector: 'uni-sum-widget',
    template: `
        <div class="positive-negative-widget"
            (click)="onClickNavigate()"
            title="{{ widget.description }}">

            <span>{{ widget.config.title}}</span>
            <span class="value" [ngClass]="{'bad': needsAttention}">
                {{ displayValue | uninumberformat: 'money' }}
            </span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UniSumWidget implements AfterViewInit {
    public widget: IUniWidget;
    public displayValue: string = '-';
    public needsAttention: boolean;

    constructor(
        private widgetDataService: WidgetDataService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {
        this.widgetDataService.getData(this.widget.config.dataEndpoint)
            .subscribe(
                (res) => {
                    if (!res || !res.Data) {
                        return;
                    }

                    const sum = res.Data[0] && (res.Data[0].sum || 0);
                    if (this.widget.config.positive) {
                        this.needsAttention = sum <= 0;
                    } else {
                        this.needsAttention = sum >= 0;
                    }
                    this.displayValue = sum;

                    this.cdr.markForCheck();
                }, err => {}
            );
    }

    public onClickNavigate() {
        if (this.widget && !this.widget._editMode) {
            this.router.navigateByUrl(this.widget.config.link);
        }
    }
}
