import {Component, OnInit} from '@angular/core';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {UniTableColumn, UniTableConfig} from '@uni-framework/ui/unitable';
import {ErrorService, TransitionService} from '@app/services/services';

@Component({
    selector: 'approval-thresholds',
    templateUrl: './approvalThresholds.html'
})
export class ApprovalThresholds implements OnInit {
    toolbarConfig: IToolbarConfig;
    transitionTableConfig: UniTableConfig;

    transitions: any[] = [];
    selectedTransition: any;

    constructor(
        private tabService: TabService,
        private errorService: ErrorService,
        private transitionService: TransitionService
    ) {}

    public ngOnInit() {
        this.tabService.addTab({
            name: 'Regler',
            url: '/admin/thresholds',
            moduleID: UniModules.Thresholds,
            active: true
        });

        this.toolbarConfig = {
            title: 'Grenseverdier for godkjenning',
            hideBreadcrumbs: true
        };

        this.initTableConfig();

        this.transitionService.GetAll().subscribe(
            transitions => {
                this.transitions = (transitions || []).map(transition => {
                    transition.Label = `${transition.EntityType}: ${transition.MethodName}`;
                    return transition;
                });

                this.selectedTransition = this.transitions[0];
            },
            err => this.errorService.handle(err)
        );
    }

    private initTableConfig() {
        this.transitionTableConfig = new UniTableConfig('admin.approvalThreshholds', false, true, 15)
            .setSearchable(true)
            .setColumnMenuVisible(false)
            .setColumns([new UniTableColumn('Label', 'Handling')]);
    }
}
