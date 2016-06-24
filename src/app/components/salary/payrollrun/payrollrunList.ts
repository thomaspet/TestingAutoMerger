import {Component, OnInit} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {Router} from '@angular/router-deprecated';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'payrollrun-list',
    templateUrl: 'app/components/salary/payrollrun/payrollrunList.html',
    directives: [UniTable],
    providers: [PayrollrunService],
    pipes: [AsyncPipe]
})

export class PayrollrunList implements OnInit {
    private payrollrunListConfig: UniTableConfig;
    private payrollRuns$: Observable<PayrollRun>;
    public busy: boolean;
    
    constructor(private routr: Router, private tabSer: TabService, private payrollService: PayrollrunService) {
        
    }
    
    public ngOnInit() {
        
        this.payrollRuns$ = this.payrollService.GetAll('ID ASC');
        var idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Text)
        .setWidth('4rem');
        var nameCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text);
        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text).setTemplate((payrollRun) => {
            var status = this.payrollService.getStatus(payrollRun);
            return status.text;
        });
        var paydateCol = new UniTableColumn('PayDate', 'Utbetalingsdato', UniTableColumnType.Date);
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.Date);
        var todateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.Date);
        
        this.payrollrunListConfig = new UniTableConfig(false)
            .setColumns([idCol, nameCol, statusCol, paydateCol, fromdateCol, todateCol]);
        
        this.tabSer.addTab({name: 'Lønnsavregninger', url: 'salary/payrollrun'});
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
            
            this.routr.navigateByUrl('/salary/payrollrun/' + response.ID);
            this.busy = false;
        },
        (err) => console.log('Error creating payrollrun: ', err));
    }

    public rowSelected(event) {
        this.routr.navigateByUrl('/salary/payrollrun/' + event.rowModel.ID);
    }
    
}
