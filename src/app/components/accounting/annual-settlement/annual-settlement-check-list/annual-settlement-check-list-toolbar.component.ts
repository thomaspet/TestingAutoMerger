import {Component} from '@angular/core';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';

@Component({
    selector: 'annual-settlement-check-list-toolbar-component',
    template: `
        <uni-toolbar
            [config]="toolbarconfig"
            [saveactions]="saveActions"
        ></uni-toolbar>
    `
})
export class AnnualSettlementCheckListToolbarComponent {
    saveActions: IUniSaveAction[] = [];
    toolbarconfig: IToolbarConfig = {
        title: 'Årsavslutning'
    };

    constructor() {
        this.saveActions.push(<IUniSaveAction> {
            action: (done) => done(),
            label: 'Lagre',
            main: true,
            disabled: false,
        });
    }
}
