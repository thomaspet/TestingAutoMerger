// angular
import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
// app
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableColumn, UniTableConfig} from 'unitable-ng2/main';
import {UniSelect, ISelectConfig} from 'uniform-ng2/main';
import {ErrorService, TransitionService} from '../../../../services/services';

@Component({
    selector: 'approval-thresholds',
    templateUrl: './approvalThresholds.html'
})
export class ApprovalThresholds implements OnInit {
    @ViewChild(UniTable)
    @ViewChild(UniSelect)
    
    private table: UniTable;

    private toolbarConfig: IToolbarConfig;
    private transitionTableConfig: UniTableConfig;

    private fieldSelectConfig: ISelectConfig;

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
                title: 'Konfigurer grenseverdier til godkjenninger',
                omitFinalCrumb: false
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
        this.transitionTableConfig = new UniTableConfig(false, true, 15)
            .setSearchable(true)
            .setColumns([new UniTableColumn('Label')]);
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
