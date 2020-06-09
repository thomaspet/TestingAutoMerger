import {Component} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {assetsTableConfig} from '@app/components/accounting/assets/assets-list/assets-table-config';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {HttpParams} from '@angular/common/http';
import {AssetsStore, IAssetState} from '@app/components/accounting/assets/assets.store';
import {Asset} from '@uni-entities';


@Component({
    selector: 'uni-assets-list-component',
    templateUrl: './assets-list.html'
})
export class AssetsListComponent {
    lookupFunction: (params: HttpParams) => Observable<Asset[]>;
    tableConfig = null;
    onDestroy$ = new Subject();
    state$: Observable<IAssetState>;
    currentAssetType = '';
    hasNotStartedDepreciations = false;
    constructor(
        private store: AssetsStore,
        private assetsActions: AssetsActions,
        private route: ActivatedRoute,
        private router: Router
    ) {
        // if something changes into state we refresh the lookup function
        this.store.state$.pipe(takeUntil(this.onDestroy$)).subscribe(state => {
            this.assetsActions.haveAssetsWithDepreciationNotStarted().subscribe(hasNotStartedDepreciations => {
                this.hasNotStartedDepreciations = hasNotStartedDepreciations;
            });
        });
        this.tableConfig = assetsTableConfig(this.assetsActions, this.router);
        this.route.queryParams.pipe(takeUntil(this.onDestroy$))
            .subscribe(params => this.lookupFunction = (httpParams: HttpParams) => {
                this.currentAssetType = params.assetType;
                return this.assetsActions.loadAssets(params.assetType, httpParams);
            });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
