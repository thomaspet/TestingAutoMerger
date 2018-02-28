// angular
import {Component, OnInit, ViewChild} from '@angular/core';
// app
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableColumn, UniTableConfig} from '../../../../../framework/ui/unitable/index';
import {UniSelect, ISelectConfig} from '../../../../../framework/ui/uniform/index';
import {ErrorService, TransitionService} from '../../../../services/services';

@Component({
    selector: 'approval-thresholds',
    templateUrl: './approvalThresholds.html'
})
export class ApprovalThresholds implements OnInit {
    @ViewChild(UniTable)
    @ViewChild(UniSelect)

    public table: UniTable;

    private toolbarConfig: IToolbarConfig;
    private transitionTableConfig: UniTableConfig;

    public fieldSelectConfig: ISelectConfig;

    private transitions: any[] = [];

    private selectedTransition: any;

    constructor(
        private tabService: TabService,
        private errorService: ErrorService,
        private transitionService: TransitionService
    ) {
    }

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

        this.transitionService.GetAll('').subscribe(
            transitions => {
                this.transitions = transitions;
                this.initTransitionLabels();
                this.selectedTransition = this.transitions[0];
            },
            err => this.errorService.handle(err)
        );
    }

    private initTableConfig() {
        this.transitionTableConfig = new UniTableConfig('admin.approvalThreshholds', false, true, 15)
            .setSearchable(true)
            .setColumns([new UniTableColumn('Label', 'Handling')]);
    }

    public onRowSelected(event) {
        if (!event.rowModel) {
            return;
        }

        this.selectedTransition = event.rowModel;
    }

    private initTransitionLabels() {
        for (var i = 0; i < this.transitions.length; ++i) {
            this.transitions[i].Label = this.transitions[i].EntityType + ': ' + this.transitions[i].MethodName;
        }
    }
}
