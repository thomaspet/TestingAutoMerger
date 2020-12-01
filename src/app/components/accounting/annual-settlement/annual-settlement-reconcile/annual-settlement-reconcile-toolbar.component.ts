import {Component, Input} from '@angular/core';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';

@Component({
    selector: 'annual-settlement-reconcile-toolbar-component',
    template: `
        <uni-toolbar
            [config]="toolbarconfig"
            [saveactions]="saveActions"
        ></uni-toolbar>
    `
})
export class AnnualSettlementReconcileToolbarComponent {
    @Input() annualSettlement;
    saveActions: IUniSaveAction[] = [];
    toolbarconfig: IToolbarConfig = {
        title: 'Årsavslutning'
    };

    constructor(private service: AnnualSettlementService) {
        this.saveActions.push(<IUniSaveAction> {
            action: (done) => {
                this.service
                    .Put(this.annualSettlement.ID, this.annualSettlement)
                    .subscribe(done);
            },
            label: 'Lagre',
            main: true,
            disabled: false,
        });
    }
}
