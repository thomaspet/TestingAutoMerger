import {Component, ViewChild} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {assetsColumns} from '@app/components/accounting/assets/assets-list/assets-table-columns';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {HttpParams} from '@angular/common/http';
import {AssetsStore, IAssetState} from '@app/components/accounting/assets/assets.store';
import {Asset, AssetStatusCode} from '@uni-entities';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {UniTableConfig} from '@uni-framework/ui/unitable';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';


@Component({
    selector: 'uni-assets-list-component',
    templateUrl: './assets-list.html'
})
export class AssetsListComponent {
    @ViewChild(AgGridWrapper) table: AgGridWrapper;
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
        private router: Router,
        private toast: ToastService
    ) {
        // if something changes into state we refresh the lookup function
        this.store.state$.pipe(takeUntil(this.onDestroy$)).subscribe(state => {
            this.assetsActions.haveAssetsWithDepreciationNotStarted().subscribe(hasNotStartedDepreciations => {
                this.hasNotStartedDepreciations = hasNotStartedDepreciations;
            });
        });
        this.tableConfig = this.createAssetsTableConfig();
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

    createAssetsTableConfig() {
        return new UniTableConfig(
            'accounting.assets.list', false, true, 15
        ).setContextMenu([
            {
                label: 'Utfør avskrivninger',
                action: () => this.assetsActions.performDepreciations()
                    .subscribe((res) => {
                        if (res?.length > 0) {
                            this.toast.addToast('Error', ToastType.bad, ToastTime.medium, JSON.stringify(res));
                        }
                        this.table.refreshTableData();
                    })
            },
            {
                label: 'Registrer som solgt',
                disabled: (item) => item.StatusCode !== AssetStatusCode.Active,
                action: (rowModel) => this.assetsActions.openRegisterAsSoldModal(rowModel)
                                                        .subscribe(() => this.table.refreshTableData())
            },
            {
                label: 'Registrer som tapt',
                disabled: (item) => item.StatusCode !== AssetStatusCode.Active,
                action: (rowModel) => this.assetsActions.openRegisterAsLostModal(rowModel)
                                                        .subscribe(() => this.table.refreshTableData())
            },
            {
                label: 'Nedskriv eiendel',
                disabled: (item) => item.StatusCode !== AssetStatusCode.Active,
                action: (rowModel) => this.assetsActions.openRegisterDepreciationModal(rowModel)
                                                        .subscribe(() => this.table.refreshTableData())
            },
            {
                label: 'Slett eiendel',
                disabled: (item) => false,
                action: (rowModel) => this.assetsActions.openDeleteModal(rowModel)
                                                        .subscribe(() => this.table.refreshTableData())
            },
        ])
        .setSortable(true)
        .setVirtualScroll(true)
        .setSearchable(true)
        .setColumnMenuVisible(true)
        .setColumns(assetsColumns(this.assetsActions, this.router));
    }
}
