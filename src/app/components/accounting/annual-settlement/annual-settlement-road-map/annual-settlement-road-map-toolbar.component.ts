import {Component} from '@angular/core';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

@Component({
    selector: 'annual-settlement-road-map-toolbar-component',
    template: `
        <uni-toolbar
            [config]="toolbarconfig"
            [saveactions]="saveActions"
        ></uni-toolbar>
    `
})
export class AnnualSettlementRoadMapToolbarComponent {
    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig = {
        title: 'Årsavslutning'
    };

    constructor(private tabService: TabService) {
        this.addTab();
    }

    private addTab() {
        this.tabService.addTab({
            name: 'Årsavslutning', url: `/accounting/annual-settlement`,
            moduleID: UniModules.Accountsettings, active: true
        });
    }
}
