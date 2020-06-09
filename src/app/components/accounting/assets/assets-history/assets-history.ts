import {Component, SimpleChanges} from '@angular/core';
import {AssetsStore, IAssetState} from '@app/components/accounting/assets/assets.store';
import {Observable} from 'rxjs';
import {historyTableConfig} from '@app/components/accounting/assets/assets-history/history-table-config';
import {ActivatedRoute, Router} from '@angular/router';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {ErrorService} from '@app/services/common/errorService';
import {safeInt} from '@app/components/common/utils/utils';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {AssetStatusCode, DepreciationLine} from '@uni-entities';
import {FieldType} from '@uni-framework/ui/uniform';

@Component({
    selector: 'uni-assets-history-component',
    templateUrl: './assets-history.html'
})
export class AssetsHistoryComponent {
    tableConfig = null;
    depreciationLines: DepreciationLine[] = [];
    autoDepreciationModel = {
        AutoDepreciation: false
    };
    autoDepreciationField = [
        {
            Property: 'AutoDepreciation',
            Label: 'La systemet bokføre avskrivningen automatisk i regnskapet',
            FieldType: FieldType.CHECKBOX,
            Options: {
                slideToggle: true
            },
            ReadOnly: false
        }
    ];
    state$: Observable<IAssetState>;
    constructor(
        private assetsActions: AssetsActions,
        private assetsStore: AssetsStore,
        private route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService
    ) {
        this.state$ = this.assetsStore.state$;
        this.tableConfig = historyTableConfig(this.router);
    }

    ngOnInit() {
        this.route.parent.params.pipe(
            take(1),
            map(params => safeInt(params.id)),
        ).subscribe((id: number) => {
            if (this.assetsStore.currentAsset?.ID === id) {
                return;
            }
            this.assetsActions.getAsset(id).pipe(
                tap(asset => this.assetsStore.currentAsset = asset),
                switchMap(asset => this.assetsActions.getDepreciationLines(id)),
                take(1)
            ).subscribe((lines: DepreciationLine[]) => {
                let asset = this.assetsStore.currentAsset;
                asset = {
                    ...asset,
                    DepreciationLines: lines
                };
                this.depreciationLines = lines;
                this.autoDepreciationModel = {
                    AutoDepreciation: asset.AutoDepreciation
                };
                const autoDepreciationFieldIsReadonly = !!(asset.AutoDepreciation
                    || asset.AssetGroupCode === 'X'
                    || asset.StatusCode !== AssetStatusCode.Active
                    || asset.DepreciationStartDate);
                const field = this.autoDepreciationField[0];
                field.ReadOnly = autoDepreciationFieldIsReadonly;
                this.autoDepreciationField = [field];
                this.assetsStore.currentAsset = asset;
            });
        },  error => this.errorService.handle(error));
    }

    ngOnDestroy() {
        this.assetsActions.setCurrentAsset(null);
    }

    onChangeEvent(changes: SimpleChanges) {
        const currentAsset = this.assetsStore.currentAsset;
        this.assetsStore.currentAsset = {
            ...currentAsset,
            AutoDepreciation: changes.AutoDepreciation.currentValue
        };
        this.assetsActions.save().subscribe(x => {
            // do nothing
        });
    }
}
