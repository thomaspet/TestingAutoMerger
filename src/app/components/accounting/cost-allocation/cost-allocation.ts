import { Component, OnDestroy, OnInit } from '@angular/core';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { CostAllocation } from '@app/unientities';
import { CostAllocationService } from '@app/services/accounting/costAllocationService';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'uni-cost-allocation',
    templateUrl: './cost-allocation.html'
})
export class UniCostAllocation implements OnInit, OnDestroy {
    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig;
    costAllocationItems: CostAllocation[];
    selectedIndex;
    _onDestroy = new Subject();

    constructor(public tabService: TabService, public costAllocationService: CostAllocationService) {
        this.tabService.addTab({
            url: '/accounting/costallocation',
            name: 'Fordelingsnøkler',
            active: true,
            moduleID: UniModules.CostAllocation
        });
        this.saveActions = [
            {
                label: 'Lagre',
                action: done => () => done(),
                disabled: false
            }
        ];
        this.toolbarconfig = <IToolbarConfig>{
            navigation: {
                add: done => { done(); },
            }
        };
    }

    ngOnInit() {
        this.costAllocationService.GetAll()
            .takeUntil(this._onDestroy)
            .subscribe(items => {
                this.costAllocationItems = items;
            });
    }

    ngOnDestroy() {
        this._onDestroy.next();
    }

    onCostAllocationSelected() {}
    onDeleteCostAllocation() {}
}
