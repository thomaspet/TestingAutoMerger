import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'payrollrun-list',
    templateUrl: 'app/components/salary/payrollrun/payrollrunList.html'
})

export class PayrollrunList implements OnInit {
    private payrollrunListConfig: UniTableConfig;
    private payrollRuns$: Observable<PayrollRun>;
    public busy: boolean;

    constructor(private router: Router, private tabSer: TabService, private payrollService: PayrollrunService) {

    }

    public ngOnInit() {

        this.payrollRuns$ = this.payrollService.GetAll('orderby=ID Desc');
        var idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Text)
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

    public createPayrollrun() {
        this.busy = true;
        var createdPayrollrun = new PayrollRun();
        var dates: any[] = this.payrollService.getEmptyPayrollrunDates();
        createdPayrollrun.FromDate = dates[0];
        createdPayrollrun.ToDate = dates[1];
        createdPayrollrun.PayDate = dates[2];
        this.payrollService.Post(createdPayrollrun)
        .subscribe((response) => {

            this.router.navigateByUrl('/salary/payrollrun/' + response.ID);
            this.busy = false;
        },
        (err) => {
            this.log(err);
            console.log('Error creating payrollrun: ', err)
        });
    }

    public rowSelected(event) {
        this.router.navigateByUrl('/salary/payrollrun/' + event.rowModel.ID);
    }

    public log(err) {
        if (err._body) {
            alert(err._body);
        } else {
            alert(JSON.stringify(err));
        }
    }

}
