import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../../../services/common/ErrorService';

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
        private errorService: ErrorService
    ) {}

    public ngOnInit() {

        this.payrollRuns$ = this.payrollService.GetAll('orderby=ID Desc').catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        var idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number)
        .setWidth('5rem');
        var nameCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text);
        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text).setTemplate((payrollRun) => {
            var status = this.payrollService.getStatus(payrollRun);
            return status.text;
        });
        var paydateCol = new UniTableColumn('PayDate', 'Utbetalingsdato', UniTableColumnType.Date);
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.Date);
        var todateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.Date);

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
