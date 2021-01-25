import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IToolbarConfig, ToolbarDropdownButton} from '@app/components/common/toolbar/toolbar';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {ConfirmActions, UniModalService} from '@uni-framework/uni-modal';
import {switchMap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';

@Component({
    selector: 'annual-settlement-road-map-toolbar-component',
    template: `
        <uni-toolbar
            [config]="toolbarconfig"
            [dropdownButton]="saveActions"
        ></uni-toolbar>
    `
})
export class AnnualSettlementRoadMapToolbarComponent {
    @Input() annualSettlement;
    @Output() runAction = new EventEmitter(true);
    saveActions: ToolbarDropdownButton;
    toolbarconfig: IToolbarConfig = {
        title: 'Årsavslutning'
    };

    constructor(
        private service: AnnualSettlementService,
        private modalService: UniModalService,
        private tabService: TabService) {
        this.addTab();
    }

    private addTab() {
        this.tabService.addTab({
            name: 'Årsavslutning', url: `/accounting/annual-settlement`,
            moduleID: UniModules.Accountsettings, active: true
        });
    }
    ngOnInit() {
        if (this.annualSettlement) {
            this.saveActions = {
                label: 'Flere valg',
                class: 'secondary',
                items: [
                    {
                        action: () => {
                            this.modalService.confirm({
                                buttonLabels: {
                                    accept: 'Nullstill',
                                    cancel: 'Avbryt'
                                },
                                header: 'Nullstill årsavslutning',
                                message: 'Ved nullstilling av årsavslutning vil vi slette det du har gjort på årsavslutning slik at du ' +
                                    'kan starte på nytt. Dersom du allerede har levert til Altinn er det viktig at du fullfører ' +
                                    'veiviser og leverer på nytt slik at du erstatter innleveringen din i Altinn.<br/><br/>' +
                                    'Ønsker du å nullstille årsavslutningen?'
                            }).onClose.pipe(
                                switchMap((modalResult) => {
                                    if (modalResult === ConfirmActions.ACCEPT) {
                                        return this.service.reset(this.annualSettlement);
                                    }
                                    return of(ConfirmActions.REJECT);
                                })
                            ).subscribe((actionResult) => {
                                if (actionResult !== ConfirmActions.REJECT) {
                                    this.runAction.emit({
                                        name: 'reset-annualsettlement'
                                    });
                                }
                            });
                        },
                        label: 'Nullstill årsavslutning'
                    }
                ]
            };
        }
    }
}
