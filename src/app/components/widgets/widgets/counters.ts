import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';

import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';
import {WidgetDataService} from '../widgetDataService';

interface ICountWidget {
    label: string;
    url: string;
    dataEndpoint: string;
    valueKey?: string;
    count?: number | string;
    class?: string;
}

@Component({
    selector: 'uni-counters-widget',
    template: `
        <section *ngFor="let counter of counters" class="uni-widget-button">
            <p>{{counter.label}}</p>
            <span [ngClass]="counter.class">
                {{counter.count}}
            </span>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCountersWidget {
    public widget: IUniWidget;
    public counters: ICountWidget[];

    constructor(
        private router: Router,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private widgetDataService: WidgetDataService,
    ) {}

    public ngAfterViewInit() {
        this.authService.authentication$.subscribe(auth => {
            const user = auth.user;
            this.counters = (this.widget && this.widget.config.counters) || [];

            const requests = this.counters.map(counter => {
                if (this.authService.canActivateRoute(user, counter.url)) {
                    return this.getCounterData(counter);
                } else {
                    return Observable.of('-');
                }
            });

            Observable.forkJoin(requests).subscribe(
                res => {
                    res.forEach((count, index) => {
                        this.counters[index].count = count;
                        if (parseInt(count, 10) && count > 0) {
                            this.counters[index].class = 'bad';
                        }
                    });

                    this.cdr.markForCheck();
                },
                err => {
                    console.error(err);
                    this.counters.forEach(counter => counter.count = '-');
                    this.cdr.markForCheck();
                }
            );
        });
    }

    private getCounterData(counter: ICountWidget) {
        return this.widgetDataService.getData(counter.dataEndpoint).map(res => {
            if (counter.valueKey) {
                return _.get(res, counter.valueKey, 0);
            } else {
                return res;
            }
        });
    }
}
