import {Component, Input, ViewChildren, provide, Injector, OnInit} from 'angular2/core';
import {RouteParams} from 'angular2/router';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../../framework/core/http/http';
import {EmployeeDS} from '../../../data/employee';

@Component({
    selector: 'salary-transactions-employee',
    templateUrl: 'app/components/salary/salarytrans/salarytransList.html',
    directives: [UniTable],
    providers: [provide(EmployeeDS, {useClass: EmployeeDS})]
})

export class SalaryTransactionEmployeeList implements OnInit {
    private salarytransEmployeeTableConfig: any;
    private salarytransEmployeeTotalsTableConfig: any;
    private employeeTotals: Array<any>;
    private employments: any[];
    @Input() private ansattID: number;
    @Input() private payrollRunID: number;
    @ViewChildren(UniTable) private tables: any;
    
    constructor(public employeeDS: EmployeeDS, 
                private injector: Injector, 
                private uniHttpService: UniHttp) {
        if (!this.ansattID) {
            let params = this.injector.parent.parent.get(RouteParams);
            this.ansattID = params.get('id');
        }
    }
    
    public ngOnInit() {
        this.uniHttpService.asGET()
        .usingBusinessDomain()
        .withEndPoint('employments')
        .send()
        .subscribe((response) => {
            this.employments = response;
            this.createTableConfig();
        });
        
        Observable.forkJoin(
            this.employeeDS.getTotals(this.ansattID)
        )
        .subscribe((response: any) => {
            let [totals] = response;
            this.employeeTotals = totals;
            this.createTotalTableConfig();
        }, (error: any) => console.log(error));
    }
    
    public ngOnChanges() {
        if (this.tables && this.ansattID) {
            this.tables.toArray()[0].updateFilter(this.buildFilter());
            this.calculateTotals();
        }
    }
    
    private buildFilter() {
        if (this.payrollRunID === undefined) {
            return 'EmployeeNumber eq ' + this.ansattID;
        } else {
            return 'EmployeeNumber eq ' + this.ansattID 
            + ' and PayrollRunID eq ' + this.payrollRunID;
        }
        
    }
    
    private createTableConfig() {
        // var wagetypeidCol = new UniTableColumn('Wagetype.WageTypeNumber', 'Lønnsart', 'string');
        var wagetypenameCol = new UniTableColumn('Text', 'Tekst', 'string');
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', 'date');
        var toDateCol = new UniTableColumn('ToDate', 'Til dato', 'date');
        var rateCol = new UniTableColumn('Rate', 'Sats', 'number');
        var amountCol = new UniTableColumn('Amount', 'Antall', 'number');
        var sumCol = new UniTableColumn('Sum', 'Beløp', 'number');
        var employmentidCol = new UniTableColumn('EmploymentID', 'Arbeidsforhold')
        .setTemplate((dataItem) => {
            return this.getEmploymentName(dataItem.EmploymentID);
        });
        var accountCol = new UniTableColumn('Account', 'Konto', 'string');
        // var payoutCol = new UniTableColumn('Wagetype.Base_Payment','Utbetales','bool');
        var transtypeCol = new UniTableColumn('IsRecurringPost', 'Fast/Variabel post', 'bool')
        .setTemplate((dataItem) => {
            if (dataItem.IsRecurringPost) {
                return 'Fast';
            } else {
                return 'Variabel';
            }
        });
        
        this.salarytransEmployeeTableConfig = new UniTableBuilder('salarytrans', true)
        .setExpand('Wagetype')
        .setFilter(this.buildFilter())
        .setPageable(false)
        .addColumns(
            // wagetypeidCol 
            wagetypenameCol
            , employmentidCol
            , fromdateCol 
            , toDateCol
            , accountCol
            , rateCol 
            , amountCol
            , sumCol
            // , payoutCol
            , transtypeCol
            );
    }
    
    private calculateTotals() {
        Observable.forkJoin(
            this.employeeDS.getTotals(this.ansattID)
        ).subscribe((response: any) => {
            let [totals] = response;
            this.employeeTotals = totals;
            this.tables.toArray()[1].refresh(this.employeeTotals);
        }, (error: any) => console.log(error));
    }
    
    private createTotalTableConfig() {
        var percentCol = new UniTableColumn('Account', 'Prosenttrekk', 'string');
        var taxtableCol = new UniTableColumn('Amount', 'Tabelltrekk', 'string');
        var paidCol = new UniTableColumn('EmployeeNumber', 'Utbetalt beløp', 'number');
        var agaCol = new UniTableColumn('Rate', 'Beregnet AGA', 'number');
        var basevacationCol = new UniTableColumn('Sum', 'Grunnlag feriepenger', 'number'); 
        
        this.salarytransEmployeeTotalsTableConfig = new UniTableBuilder(this.employeeTotals, false)
        .addColumns(percentCol, taxtableCol, paidCol, agaCol, basevacationCol);
    }
    
    private getEmploymentName(employmentID: number) {
        var name = '';
        for (var i = 0; i < this.employments.length; i++) {
            var employment = this.employments[i];
            if (employment.ID === employmentID) {
                name = employment.JobName;
                break;
            }
        }
        return name;
    }
}
