import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService} from '../../../services/services';

@Component({
    selector: 'payrollrun-list',
    templateUrl: 'app/components/salary/payrollrun/payrollrunList.html',
    directives: [UniTable],
    providers: [PayrollrunService]
})

export class PayrollrunList implements OnInit {
    private payrollrunListConfig: any;
    
    constructor(private routr: Router, private tabSer: TabService, private payrollService: PayrollrunService) {
        
    }
    
    public ngOnInit() {
        
        
        var idCol = new UniTableColumn('ID', 'Nr', 'string')
        .setWidth('4rem');
        var nameCol = new UniTableColumn('Description', 'Navn', 'string');
        var statusCol = new UniTableColumn('StatusCode', 'Status', 'string').setTemplate((payrollRun) => {
            var status = this.payrollService.getStatus(payrollRun);
            return status.text;
        });
        var paydateCol = new UniTableColumn('PayDate', 'Utbetalingsdato', 'date');
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', 'date');
        var todateCol = new UniTableColumn('ToDate', 'Til dato', 'date');
        
        this.payrollrunListConfig = new UniTableBuilder('payrollrun', false)
            .setSelectCallback((selected: PayrollRun) => {
                this.routr.navigateByUrl('/salary/payrollrun/' + selected.ID);
            })
            .setOrderBy('ID', 'asc')
            .addColumns(idCol, nameCol, statusCol, paydateCol, fromdateCol, todateCol);

        this.tabSer.addTab({ name: 'Lønnsavregninger', url: 'salary/payrollrun', moduleID: 14, active: true });
    }
    
    public createPayrollrun() {
        var createdPayrollrun = new PayrollRun();
        var dates: any[] = this.payrollService.getEmptyPayrollrunDates();
        createdPayrollrun.FromDate = dates[0];
        createdPayrollrun.ToDate = dates[1];
        createdPayrollrun.PayDate = dates[2];
        this.payrollService.Post(createdPayrollrun)
        .subscribe((response) => {
            
            this.routr.navigateByUrl('/salary/payrollrun/' + response.ID);
        },
        (err) => console.log('Error creating payrollrun: ', err));
    }
    
}
