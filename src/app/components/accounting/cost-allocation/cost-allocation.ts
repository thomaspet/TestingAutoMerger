import { Component } from '@angular/core';
import { of } from 'rxjs/observable/of';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-cost-allocation',
    templateUrl: './cost-allocation.html'
})
export class UniCostAllocation {
    saveActions = [
        {
            label: 'Lagre',
            action: done => () => of(null),
            disabled: false
        }
    ];
    toolbarconfig = {
        navigation: {
            add: done => () => of(null),
        }
    };

    constructor(public tabService: TabService) {
        this.tabService.addTab({
            url: '/accounting/costallocation/',
            name: 'Fordelingsnøkler',
            active: true,
            moduleID: UniModules.CostAllocation
        });
    }
}
