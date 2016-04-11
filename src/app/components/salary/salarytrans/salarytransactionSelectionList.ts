import {Component, ViewChildren, OnInit} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {SalaryTransactionEmployeeList} from './salarytransList';
import {SalarytransFilter} from './salarytransFilter';
import {UniHttp} from '../../../../framework/core/http/http';
import {PayrollRun} from '../../../unientities';

@Component({
    templateUrl: 'app/components/salary/salarytrans/salarytransactionSelectionList.html',
    directives: [UniTable, SalaryTransactionEmployeeList, SalarytransFilter]
})

export class SalaryTransactionSelectionList implements OnInit {
    private salarytransSelectionTableConfig: UniTableBuilder;
    private selectedEmployeeID: number;
    private selectedPayrollRunID: number;
    private payrollRun: PayrollRun;
    private bankaccountCol: UniTableColumn;
    private taxcardCol: UniTableColumn;
    private payDate: any;
    @ViewChildren(UniTable) private tables: any;
    
    constructor(private uniHttpService: UniHttp) {
        
    }
    
    public ngOnInit() {
        this.uniHttpService.asGET()
        .usingBusinessDomain()
        .withEndPoint('payrollrun/1')
        .send()
        .subscribe((response: PayrollRun) => {
            this.payrollRun = response; //this.choosePayrollRun(response);
            console.log('tables: ' + JSON.stringify(this.payrollRun));
            this.payDate = this.payrollRun.PayDate;
            this.selectedPayrollRunID = this.payrollRun.ID;
            this.createTableConfig();
            // this.tables.toArray()[0].hideColumn('BankAccounts');
            // this.tables.toArray()[0].hideColumn('TaxTable');
        });
    }
    
    private choosePayrollRun(response: PayrollRun[]): PayrollRun {
        var activeRuns = response.filter( run => run.SettlementDate === null);
        if (activeRuns.length > 0) {
            return Math.max.apply(Math, activeRuns.map(run => run.ToDate));
        }
        return Math.max.apply(Math, response.map(run => run.ToDate));
    }
    
    private createTableConfig() {
        
        var employeenumberCol = new UniTableColumn('EmployeeNumber', 'Ansattnr.', 'number');
        var nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', 'string');
        this.bankaccountCol = new UniTableColumn('BankAccounts', 'Bankkonto')
            .setTemplate((dataItem) => {
                return this.getStandardBankAccountNumber(dataItem.BankAccounts);
            });
            
        
        this.taxcardCol = new UniTableColumn('TaxTable', 'Skattekort', 'string');
        var forpayoutCol = new UniTableColumn('Pay', 'Beløp til utbetaling', 'number');
        var subEntityCol = new UniTableColumn('SubEntity.BusinessRelationInfo.Name', 'Virksomhet', 'string');
        this.salarytransSelectionTableConfig = new UniTableBuilder('employees', false)
        .setExpand('BusinessRelationInfo,SubEntity.BusinessRelationInfo,BankAccounts')
        .setSelectCallback((selEmp) => {
            this.selectedEmployeeID = selEmp.EmployeeNumber;
        })
        .setFilterable(false)
        .addColumns(
            employeenumberCol,
            nameCol,
            this.bankaccountCol,
            this.taxcardCol,
            subEntityCol,
            forpayoutCol
            );
            
        
    }
    
    private getStandardBankAccountNumber(bankAccounts: any) {
        var bAccount = '';
        for (var i = 0; i < bankAccounts.length; i++) {
            var bankAccount = bankAccounts[i];
            if (bankAccount.Active === true) {
                bAccount = bankAccount.AccountNumber;
            }
        }
        return bAccount;
    }
    
    public goToNext() {
        console.log('Next event');
    }
    
    public changeFilter(filter: string) {
        this.tables.toArray()[0].updateFilter(filter);
        this.selectedEmployeeID = 0;
    }
}
