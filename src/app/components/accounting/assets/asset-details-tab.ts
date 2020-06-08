import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'asset-detail-tab',
    template: `
        <asset-details-toolbar></asset-details-toolbar>
        <section class="application">
            <uni-tabs [tabs]="childRoutes" [useRouterLinkTabs]="true"></uni-tabs>
            <router-outlet></router-outlet>
        </section>
    `
})
export class AssetDetailsTab {
    onDestroy$ = new Subject();
    public childRoutes: any[] = [
        { name: 'Detaljer', path: 'details' },
        { name: 'Avskrivning historikk', path: 'history' },
        { name: 'Dokumenter', path: 'documents' },
    ];

    constructor(private route: ActivatedRoute) {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map(params => +params?.id)
        ).subscribe(id => {
            if (id === 0) {
                const historyTab = this.childRoutes[1];
                const childRoutes = this.childRoutes;
                historyTab.disabled = true;
                childRoutes[1] = historyTab;
                this.childRoutes = [...childRoutes];
            } else {
                const historyTab = this.childRoutes[1];
                const childRoutes = this.childRoutes;
                historyTab.disabled = false;
                childRoutes[1] = historyTab;
                this.childRoutes = [...childRoutes];
            }
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
