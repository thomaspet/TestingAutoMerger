import {Component, ErrorHandler} from '@angular/core';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {AssetsStore} from '@app/components/accounting/assets/assets.store';
import {finalize, take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';
import {Asset, AssetStatusCode} from '@uni-entities';
import {STATUSTRACK_STATES} from '@app/components/common/toolbar/statustrack';

@Component({
    selector: 'asset-details-toolbar',
    template: `
        <uni-toolbar
            [config]="toolbarconfig"
            [saveactions]="saveActions"
        ></uni-toolbar>
    `
})
export class AssetDetailsToolbar {

    asset: Asset;
    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig;
    onDestroy$ = new Subject();

    constructor(
        private tabService: TabService,
        private assetsActions: AssetsActions,
        private assetsStore: AssetsStore,
        private router: Router,
        private errorHandler: ErrorHandler
    ) {}

    ngOnInit() {
        this.assetsStore.state$.pipe(takeUntil(this.onDestroy$))
            .subscribe(state => {
                this.asset = state.currentAsset;
                this.setSaveActions();
                this.addTab(this.asset);
                this.setToolbarConfig(this.asset);
            });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    getStatusText(code: number) {
        switch (code) {
            case AssetStatusCode.Active:
                return 'Aktiv';
            case AssetStatusCode.Depreciated:
                return 'Avskrevet';
            case AssetStatusCode.Sold:
                return 'Solgt';
            case AssetStatusCode.Lost:
                return 'Tapt';
            case AssetStatusCode.DepreciationFailed:
                return 'Avskrivsning feil';
            default:
                return 'Status not defined';
        }
    }

    getStateText(code: number): STATUSTRACK_STATES {
        switch (code) {
            case AssetStatusCode.Active:
                return STATUSTRACK_STATES.Active;
            case AssetStatusCode.Depreciated:
                return STATUSTRACK_STATES.Depreciated;
            case AssetStatusCode.Sold:
                return STATUSTRACK_STATES.Sold;
            case AssetStatusCode.Lost:
                return STATUSTRACK_STATES.Lost;
            case AssetStatusCode.DepreciationFailed:
                return STATUSTRACK_STATES.DepreciationFailed;
            default:
                return STATUSTRACK_STATES.Obsolete;
        }
    }

    createStatus(asset: Asset) {
        if (!asset || !asset?.ID) {
            return [];
        }
        return [{
            title: this.getStatusText(asset?.StatusCode),
            state: this.getStateText(asset?.StatusCode),
            code: asset?.StatusCode,
        }];
    }
    private setToolbarConfig(asset: Asset) {
        this.toolbarconfig = {
            title: asset?.Name || 'Ny Eiendel',
            statustrack: this.createStatus(asset),
            contextmenu: [
                {
                    label: 'Register som solgt',
                    action: () => this.assetsActions.openRegisterAsSoldModal(this.asset)
                },
                {
                    label: 'Register som tapt',
                    action: () => this.assetsActions.openRegisterAsLostModal(this.asset)
                },
                {
                    label: 'Nedskriv eiendel',
                    action: () => this.assetsActions.openRegisterDepreciationModal(this.asset)
                },
                {
                    label: 'Slett eiendel',
                    action: () => this.assetsActions.openDeleteModal(this.asset)
                },
            ]
        };
    }

    private setSaveActions() {
        this.saveActions = [{
            label: 'Lagre',
            action: (done) => this.assetsActions.save().subscribe(asset => {
                if (asset.ID === 0) {
                    done('Asset ikke lagret');
                } else {
                    done('Asset Lagret');
                }
                this.assetsStore.assetIsDirty = false;
                this.assetsStore.currentAsset = asset;
                this.router.navigateByUrl(`/accounting/assets/${asset.ID}`);
            }, (error) => {
                this.errorHandler.handleError(error);
                done()

            }),
            disabled: !this.assetsStore.state.assetIsDirty
        }];
    }

    private addTab(asset: Asset) {
        let title = asset?.Name ? `Eiendeler ${asset?.ID}` : 'Ny eiendel';
        const id = asset?.ID ? asset.ID : 0;
        if (id === 0) {
            title = 'Ny eiendel';
        }
        this.tabService.addTab({
            name: `${title}`, url: `/accounting/assets/${id}`,
            moduleID: UniModules.Accountsettings, active: true
        });
    }
}
