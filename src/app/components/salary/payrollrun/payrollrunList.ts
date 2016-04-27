import {Component, OnInit} from 'angular2/core';
import {Router} from 'angular2/router';
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
    private payStatusTable: any[];
    
    constructor(private routr: Router, private tabSer: TabService, private payrollService: PayrollrunService) {
        
    }
    
    public ngOnInit() {
        
        this.payStatusTable = [
            {ID: 0 || null, text: 'Opprettet'},
            {ID: 1, text: 'Avregnet'},
            {ID: 2, text: 'Godkjent'},
            {ID: 3, text: 'Sendt til utbetaling'},
            {ID: 4, text: 'Utbetalt'},
            {ID: 5, text: 'Bokført'},
            {ID: 6, text: 'Slettet'}
        ];
        
        var idCol = new UniTableColumn('ID', 'Nr', 'string')
        .setWidth('4rem');
        var nameCol = new UniTableColumn('Description', 'Navn', 'string');
        var statusCol = new UniTableColumn('StatusCode', 'Status', 'string').setTemplate((payrollRun) => {
            var status = this.payStatusTable.find(x => x.ID === payrollRun.StatusCode);
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
        
        this.tabSer.addTab({name: 'Lønnsavregninger', url: 'salary/payrollrun'});
    }
    
    public createPayrollrun() {
        var createdPayrollrun = new PayrollRun();
        this.payrollService.Post(createdPayrollrun)
        .subscribe((response) => {
            this.routr.navigateByUrl('/salary/payrollrun/' + response.ID);
        },
        (err) => console.log('Error creating payrollrun: ', err));
    }
}
