import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService, ErrorService, FinancialYearService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'payrollrun-list',
    templateUrl: 'app/components/salary/payrollrun/payrollrunList.html'
})

export class PayrollrunList implements OnInit {
    private payrollrunListConfig: UniTableConfig;
    private payrollRuns$: Observable<PayrollRun>;
    public busy: boolean;

    constructor(
        private router: Router,
        private tabSer: TabService,
        private payrollService: PayrollrunService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService
    ) { }

    public ngOnInit() {

        this.financialYearService.lastSelectedYear$.subscribe( year => {
            this.payrollRuns$ = this.payrollService
            .GetAll('orderby=ID Desc' + (year && year.Year ? '&filter=year(PayDate) eq ' + year.Year : ''))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        });

        var idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number)
            .setWidth('5rem');
        var nameCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text);
        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text).setTemplate((payrollRun) => {
            var status = this.payrollService.getStatus(payrollRun);
            return status.text;
        });
        var paydateCol = new UniTableColumn('PayDate', 'Utbetalingsdato', UniTableColumnType.LocalDate);
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate);
        var todateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate);

        this.payrollrunListConfig = new UniTableConfig(false)
            .setColumns([idCol, nameCol, statusCol, paydateCol, fromdateCol, todateCol])
            .setSearchable(true);

        this.tabSer.addTab({ name: 'Lønnsavregninger', url: 'salary/payrollrun', moduleID: UniModules.Payrollrun, active: true });
    }

    public newPayrollrun() {
        this.router.navigateByUrl('/salary/payrollrun/' + 0);
    }

    public rowSelected(event) {
        this.router.navigateByUrl('/salary/payrollrun/' + event.rowModel.ID);
    }
}
