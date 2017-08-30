import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService, ErrorService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'payrollrun-list',
    templateUrl: './payrollrunList.html'
})
export class PayrollrunList implements OnInit {
    private payrollrunListConfig: UniTableConfig;
    private payrollRuns$: Observable<PayrollRun>;
    public busy: boolean;

    constructor(
        private router: Router,
        private tabSer: TabService,
        private payrollService: PayrollrunService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() {
        this.createTableConfig();
        this.loadData();
        this.addTab();
    }

    private createTableConfig() {
        const idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number)
            .setWidth('5rem');
        const nameCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text);
        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setTemplate((payrollRun) => {
                var status = this.payrollService.getStatus(payrollRun);
                return status.text;
            });
        const payStatusCol = new UniTableColumn(
            this.payrollService.payStatusProp,
            'Betalingsstatus',
            UniTableColumnType.Text)
            .setTemplate((payrollRun) => this.payrollService.GetPaymentStatusText(payrollRun));

        const paydateCol = new UniTableColumn('PayDate', 'Utbetalingsdato', UniTableColumnType.LocalDate);
        const fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate);
        const todateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate);

        this.payrollrunListConfig = new UniTableConfig('salary.payrollrun.payrollrunList', false)
            .setColumns([idCol, nameCol, statusCol, payStatusCol, paydateCol, fromdateCol, todateCol])
            .setSearchable(true);
    }

    private loadData() {
        this.busy = true;
        this.payrollRuns$ = this.payrollService
            .getAll(`orderby=ID desc`, true)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .finally(() => this.busy = false);
    }

    private addTab() {
        this.tabSer.addTab(
            {
                name: 'Lønnsavregninger',
                url: 'salary/payrollrun',
                moduleID: UniModules.Payrollrun,
                active: true
            }
        );
    }

    public newPayrollrun() {
        this.router.navigateByUrl('/salary/payrollrun/' + 0);
    }

    public rowSelected(event) {
        this.router.navigateByUrl('/salary/payrollrun/' + event.rowModel.ID);
    }
}
