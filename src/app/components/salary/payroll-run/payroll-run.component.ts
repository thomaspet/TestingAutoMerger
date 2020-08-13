import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {PayrollRun} from '../../../unientities';
import { SharedPayrollRunService, ErrorService } from '@app/services/services';
import { PayrollRunService } from '@app/components/salary/shared/services/payroll-run/payroll-run.service';

@Component({
    selector: 'payrollrun-list',
    templateUrl: './payroll-run.component.html'
})
export class PayrollRunListComponent implements OnInit {
    payrollrunListConfig: UniTableConfig;
    payrollRuns: PayrollRun[];

    toolbarActions = [{
        label: 'SALARY.PAYROLL.NEW',
        action: this.newPayrollrun.bind(this),
        main: true,
        disabled: false
    }];

    constructor(
        private router: Router,
        private tabService: TabService,
        private errorService: ErrorService,
        private sharedPayrollRunService: SharedPayrollRunService,
        private payrollRunService: PayrollRunService,
    ) {}

    public ngOnInit() {
        this.createTableConfig();
        this.sharedPayrollRunService.getAll(`orderby=ID desc`, true).subscribe(
            res => this.payrollRuns = res,
            err => this.errorService.handle(err)
        );

        this.tabService.addTab({
            name: 'NAVBAR.PAYROLL',
            url: 'salary/payrollrun',
            moduleID: UniModules.Payrollrun,
            active: true
        });
    }

    public newPayrollrun(done) {
        this.router.navigateByUrl('/salary/payrollrun/' + 0).then(succeeded => {
            if (!succeeded) {
                done('Avbrutt');
            }
        });
    }

    rowSelected(row) {
        this.router.navigateByUrl('/salary/payrollrun/' + row.ID);
    }

    private createTableConfig() {
        const idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number)
            .setWidth('5rem');
        const nameCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text);
        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setTemplate((payrollRun) => {
                const status = this.payrollRunService.getStatus(payrollRun);
                return status.text;
            });
        const payStatusCol = new UniTableColumn(
            this.sharedPayrollRunService.payStatusProp,
            'Betalingsstatus',
            UniTableColumnType.Text)
            .setTemplate((payrollRun) => this.payrollRunService.GetPaymentStatusText(payrollRun));

        const paydateCol = new UniTableColumn('PayDate', 'Utbetalingsdato', UniTableColumnType.LocalDate);
        const fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate);
        const todateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate);

        this.payrollrunListConfig = new UniTableConfig('salary.payrollrun.payrollrunList', false)
            .setColumns([idCol, nameCol, statusCol, payStatusCol, paydateCol, fromdateCol, todateCol])
            .setSearchable(true);
    }
}
