import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';

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
    @Input() annualSettlement;
    @Output() runAction = new EventEmitter(true);
    saveActions: IUniSaveAction[] = [];
    toolbarconfig: IToolbarConfig = {
        title: 'Årsavslutning'
    };

    constructor(private service: AnnualSettlementService, private tabService: TabService) {
        this.addTab();
        if (this.annualSettlement?.ID) {
            this.saveActions.push(<IUniSaveAction>{
                action: (done) => {
                    this.service
                        .reset(this.annualSettlement)
                        .subscribe(() => {
                            this.runAction.emit({
                                name: 'reset-annualsettlement'
                            });
                            done();
                        });
                },
                label: 'Reset annual settlement',
                main: true,
                disabled: false,
            });
        }
    }

    private addTab() {
        this.tabService.addTab({
            name: 'Årsavslutning', url: `/accounting/annual-settlement`,
            moduleID: UniModules.Accountsettings, active: true
        });
    }
}
