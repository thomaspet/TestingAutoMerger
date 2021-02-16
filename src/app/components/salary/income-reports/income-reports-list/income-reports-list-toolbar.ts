import {Component, EventEmitter, Output} from '@angular/core';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {ToastService} from '@uni-framework/uniToast/toastService';
import { IncomeReportsActions } from '../income-reports.actions';

@Component({
    selector: 'income-reports-list-toolbar',
    template: `
        <uni-toolbar
            [config]="toolbarconfig"
            [saveactions]="saveActions">
        </uni-toolbar>
    `
})
export class IncomeReportsListToolbar {

    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig = {
        title: 'Inntektsmelding',
    };

    constructor(
        private tabService: TabService,
        private incomeReportsActions: IncomeReportsActions    ) {}

    ngOnInit() {
        this.addTab();
        this.setSaveActions();
    }

    private addTab() {
        this.tabService.addTab({
            name: 'Inntektsmelding', url: '/salary/incomereports',
            moduleID: UniModules.IncomeReports, active: true
        });
    }

    private setSaveActions() {
        this.saveActions = [{
            label: 'Ny inntektsmelding',
            action: (done) => {
                this.incomeReportsActions.navigateToNewIncomeReport();
                done();
            }
        }];
    }
}
