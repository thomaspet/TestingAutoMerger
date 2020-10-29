import {Component} from '@angular/core';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';

@Component({
    selector: 'annual-settlement-toolbar-component',
    templateUrl: './annual-settlement-toolbar.component.html'
})
export class AnnualSettlementToolbarComponent {
    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig = {
        title: 'Årsavslutning'
    };

    constructor() {}
}
