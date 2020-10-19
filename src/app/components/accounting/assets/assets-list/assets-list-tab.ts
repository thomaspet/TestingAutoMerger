import {Component, EventEmitter, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'assets-list-tab',
    template: `<uni-tabs [tabs]="tabs" [activeIndex]="activeIndex" (tabClick)="tabOnClick($event)" [useRouterLinkTabs]="false"></uni-tabs>`
})
export class AssetsListTab {
    @Output() tabsReady: EventEmitter<any> = new EventEmitter<any>();
    @Output() activeTabChange: EventEmitter<any> = new EventEmitter<any>();
    onDestroy$ = new Subject();
    activeIndex = 0;
    tabs = [
        {name: 'Aktive', count: 0},
        {name: 'Tapte', count: 0},
        {name: 'Solgte', count: 0},
        {name: 'Avskrevet', count: 0},
        {name: 'Kladd', count: 0},
        {name: 'Alle', count: 0}
    ];
    constructor(private router: Router, private assetsActions: AssetsActions, private route: ActivatedRoute) {
        this.assetsActions.getAssetsTypeCounters().pipe(take(1)).subscribe((counters) => {
            this.tabs = this.tabs.map((tab, i) => {
                tab.count = counters[i];
                return tab;
            });
            this.tabsReady.emit(this.tabs);
        });
    }

    ngOnInit() {
        this.route.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
            this.activeTabChange.emit(params.assetType || 'Alle');
            if (!params.assetType) {
                this.activeIndex = 5;
            } else {
                switch (params.assetType) {
                    case 'Aktive': this.activeIndex = 0;
                        break;
                    case 'Tapte': this.activeIndex = 1;
                        break;
                    case 'Solgte': this.activeIndex = 2;
                        break;
                    case 'Avskrevet': this.activeIndex = 3;
                        break;
                    case 'Kladd': this.activeIndex = 4;
                        break;
                    default:
                        this.activeIndex = 5;
                }
            }
        });
    }

    tabOnClick(clickedTab) {
        this.router.navigateByUrl(`/accounting/assets?assetType=${clickedTab.name}`);
        this.activeIndex = this.tabs.findIndex(tab => tab.name === clickedTab.name);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
