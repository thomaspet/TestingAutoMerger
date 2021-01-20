import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { IncomeReportsActions } from '../income-reports.actions';

@Component({
    selector: 'income-reports-list-tab',
    template: `<uni-tabs [tabs]="tabs" [activeIndex]="activeIndex" (tabClick)="tabOnClick($event)" [useRouterLinkTabs]="false"></uni-tabs>`
})
export class IncomeReportsListTab {
    @Output() tabsReady: EventEmitter<any> = new EventEmitter<any>();
    @Output() activeTabChange: EventEmitter<any> = new EventEmitter<any>();
    onDestroy$ = new Subject();
    activeIndex = 0;
    tabs = [
        {name: 'Opprettet', count: 0},
        {name: 'Innsendt', count: 0},
        {name: 'Avvist', count: 0},
        {name: 'Alle', count: 0}
    ];
    constructor(private router: Router, private incomeReportActions: IncomeReportsActions, private route: ActivatedRoute) {
        this.incomeReportActions.getIncomeReportCounters().pipe(take(1)).subscribe((counters) => {
            this.tabs = this.tabs.map((tab, i) => {
                tab.count = counters[i];
                return tab;
            });
            this.tabsReady.emit(this.tabs);
        });
    }

    ngOnInit() {
        this.route.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
            this.activeTabChange.emit(params.incomeReportTab || 'Alle');
            if (!params.incomeReportTab) {
                this.activeIndex = 3;
            } else {
                switch (params.incomeReportTab) {
                    case 'Opprettet': this.activeIndex = 0;
                        break;
                    case 'Innsendt': this.activeIndex = 1;
                        break;
                    case 'Avvist': this.activeIndex = 2;
                        break;
                    case 'Alle': this.activeIndex = 3;
                        break;
                    default:
                        this.activeIndex = 3;
                }
            }
        });
    }

    tabOnClick(clickedTab) {
        this.router.navigateByUrl(`/salary/incomereports?incomereportstatus=${clickedTab.name}`);
        this.activeIndex = this.tabs.findIndex(tab => tab.name === clickedTab.name);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
