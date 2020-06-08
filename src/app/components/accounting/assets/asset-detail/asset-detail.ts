import {Component, SimpleChanges} from '@angular/core';
import {AssetsStore, IAssetState} from '@app/components/accounting/assets/assets.store';
import {ActivatedRoute} from '@angular/router';
import {map, take, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {ErrorService} from '@app/services/common/errorService';
import {safeInt} from '@app/components/common/utils/utils';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {Asset} from '@uni-entities';

@Component({
    selector: 'asset-details',
    templateUrl: './asset-detail.html'
})
export class AssetsDetailComponent {
    state$: Observable<IAssetState>;
    activeIndex = 0;
    onDestroy$ = new Subject();
    supplierInvoiceID = 0;
    constructor(
        private assetsActions: AssetsActions,
        private assetsStore: AssetsStore,
        private route: ActivatedRoute,
        private errorService: ErrorService
    ) {
        this.state$ = this.assetsStore.state$;
    }

    ngOnInit() {
        this.route.parent.params.pipe(
            takeUntil(this.onDestroy$),
            map(parentParams => safeInt(parentParams.id))
        ).subscribe((id) => {
            if (id === 0) {
                this.assetsStore.assetIsDirty = false;
                this.route.queryParams.pipe(take(1)).subscribe((params) => {
                    this.supplierInvoiceID = params.supplierInvoiceID || 0;
                    let source: any = this.assetsActions.getNewAsset().pipe(take(1));
                    if (params.supplierInvoiceID) {
                        source = this.assetsActions.createAsset(params.supplierInvoiceID).pipe(take(1))
                        this.assetsStore.assetIsDirty = true;
                    }
                    source.subscribe(asset => {
                        if (params.supplierInvoiceID) {
                            this.assetsActions.getSupplierInvoiceFiles(this.supplierInvoiceID)
                                .subscribe(files => {
                                    asset['_files'] = files || [];
                                    this.assetsStore.currentAsset = asset;
                                });
                        } else {
                            this.assetsStore.currentAsset = asset;
                            asset['_files'] = [];
                        }
                    });
                });
            } else {
                this.assetsActions.getAsset(id).subscribe((asset: Asset) => {
                    this.assetsStore.currentAsset = asset;
                });
            }
        }, error => this.errorService.handle(error));
    }

    onChangeEvent(changes: SimpleChanges) {
        this.assetsStore.assetIsDirty = true;
        this.assetsActions.updateCurrentAssetFromChanges(changes);
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.assetsStore.assetIsDirty) {
            return true;
        }
        return this.assetsActions.openAskForSaveAssetModal();
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
