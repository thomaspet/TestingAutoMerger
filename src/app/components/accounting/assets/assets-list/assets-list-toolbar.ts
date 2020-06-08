import {Component} from '@angular/core';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';

@Component({
    selector: 'assets-list-toolbar',
    template: `
        <uni-toolbar
            [config]="toolbarconfig"
            [saveactions]="saveActions"
        ></uni-toolbar>
    `
})
export class AssetsListToolbar {
    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig = {
        title: 'Eiendeler'
    };

    constructor(
        private tabService: TabService,
        private assetsActions: AssetsActions
    ) {}

    ngOnInit() {
        this.addTab();
        this.setSaveActions();
    }

    private addTab() {
        this.tabService.addTab({
            name: 'Eiendeler', url: '/accounting/assets',
            moduleID: UniModules.Accountsettings, active: true
        });
    }

    private setSaveActions() {
        this.saveActions = [{
            label: 'Registrer ny eiendel',
            action: () => this.assetsActions.navigateToNewAsset()
        }];
    }
}
