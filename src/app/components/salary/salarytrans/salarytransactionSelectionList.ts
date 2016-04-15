import {Component, ViewChild, OnInit} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {SalaryTransactionEmployeeList} from './salarytransList';
import {SalarytransFilter} from './salarytransFilter';
import {UniHttp} from '../../../../framework/core/http/http';
import {PayrollRun, Employee} from '../../../unientities';
import {EmployeeService, PayrollRunService} from '../../../services/services';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs/Observable';
declare var _

@Component({
    templateUrl: 'app/components/salary/salarytrans/salarytransactionSelectionList.html',
    directives: [UniTable, SalaryTransactionEmployeeList, SalarytransFilter],
    providers: [EmployeeService, PayrollRunService]
})

export class SalaryTransactionSelectionList implements OnInit {
    private salarytransSelectionTableConfig: UniTableBuilder;
    private selectedEmployeeID: number;
    private selectedPayrollRunID: number;
    private payrollRun: PayrollRun;
    private bankaccountCol: UniTableColumn;
    private taxcardCol: UniTableColumn;
    private payDate: any;
    private employeeList: Employee[] = [];
    
    public busy: boolean;
    @ViewChild(UniTable) private tables: UniTable;
    
    constructor(private uniHttpService: UniHttp,
                private tabSer: TabService,
                private _employeeService: EmployeeService) {
    }
    
    public ngOnInit() {
        this.uniHttpService.asGET()
        .usingBusinessDomain()
        .withEndPoint('payrollrun/1')
        .send()
        .subscribe((response: PayrollRun) => {
            this.payrollRun = response;
            this.payDate = this.formatDate(this.payrollRun.PayDate);
            this.selectedPayrollRunID = this.payrollRun.ID;
            this.tableConfig();
        });
     
        this.tabSer.addTab({name: 'Transaksjoner', url: '/salary/salarytrans'});   
    }
    
    private tableConfig(update: boolean = false, filter = '') {
        this.busy = true;
        Observable.forkJoin(
            this._employeeService.GetAll(filter ? 'filter=' + filter : '', ['BusinessRelationInfo', 'SubEntity.BusinessRelationInfo', 'BankAccounts'])
            )
            .subscribe((response: any) => {
            let [emp] = response;
            this.employeeList = emp;
            
            if (update) {
                this.tables.refresh(this.employeeList);
            } else {
                
                var employeenumberCol = new UniTableColumn('EmployeeNumber', '#', 'number').setWidth('10%');
                var nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', 'string');
                var lockedCol = new UniTableColumn('', 'Synlig/låst', 'boolean')
            .setClass('icon-column')
            .setTemplate(
                "#if(TaxTable === null || !BankAccounts.some(x => x.Active === true)) {#<span class='missing-info' role='presentation'>Visible</span>#} " +
                "else {#<span role='presentation'></span>#}# "
            )
            .setWidth('2rem');
                this.bankaccountCol = new UniTableColumn('BankAccounts', 'Bankkonto')
                    .setHidden(true)
                    .setTemplate((dataItem) => {
                        return this.getStandardBankAccountNumber(dataItem.BankAccounts);
                    });
            
                this.taxcardCol = new UniTableColumn('TaxTable', 'Skattekort', 'string').setHidden(true);
                // var forpayoutCol = new UniTableColumn('Pay', 'Beløp til utbetaling', 'number');
                var subEntityCol = new UniTableColumn('SubEntity.BusinessRelationInfo.Name', 'Virksomhet', 'string');
                this.salarytransSelectionTableConfig = new UniTableBuilder(this.employeeList, false)
                .setSelectCallback((selEmp) => {
                    this.selectedEmployeeID = selEmp.ID;
                })
                .setColumnMenuVisible(false)
                .setFilterable(false)
                .addColumns(
                    employeenumberCol,
                    nameCol,
                    this.bankaccountCol,
                    this.taxcardCol,
                    subEntityCol,
                    lockedCol
                    // forpayoutCol
                );
            }
            this.busy = false;
            
        });
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
    
    private formatDate(date) {
        if (!date) {
            return '';
        }
        date = new Date(date);
        var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
        
        return day + '.' + month + '.' + date.getFullYear();
    }
    
    
    
    public goToNextEmployee(id) {
        var index = _.findIndex(this.employeeList, x => x.ID === this.selectedEmployeeID);
        if (index + 1 < this.employeeList.length) {
            this.selectedEmployeeID = this.employeeList[index + 1].ID;
        }
    }
    
    public goToPreviousEmployee(id) {
        var index = _.findIndex(this.employeeList, x => x.ID === this.selectedEmployeeID);
        if (index > 0) {
            this.selectedEmployeeID = this.employeeList[index - 1].ID;
        }
    }
    
    public previousPayrollRun() {
        // should be moved to payrollrun
        /*this._payrollRunService.next(this.selectedPayrollRunID).subscribe((response: PayrollRun) => {
            this.selectedEmployeeID = 0;
            this.selectedPayrollRunID = response.ID;
            this.status = _.find(this.payrollStatus, x => x.Code === response.StatusCode ? response.StatusCode : 0);
        }, (error) => console.error(error));*/
    }
    
    public nextPayrollRun() {
        
        /*this._payrollRunService.previous(this.selectedPayrollRunID).subscribe((response: PayrollRun) => {
            this.selectedEmployeeID = 0;
            this.selectedPayrollRunID = response.ID;
            this.status = _.find(this.payrollStatus, x => x.Code === response.StatusCode ? response.StatusCode : 0);
        }, (error) => console.error(error));*/
    }
    
    public changeFilter(filter: string) {
        //this.tables.updateFilter(filter);
        this.tableConfig(true, filter);
        this.selectedEmployeeID = 0;
    }
    
    public saveRun(event: any) {
        /*var saveRequest;
        if (this.payrollRun.ID) {
            saveRequest = this._payrollRunService.Put(this.payrollRun.ID, this.payrollRun);
        }else {
            saveRequest = this._payrollRunService.Post(this.payrollRun);
        }
        saveRequest.subscribe((response) => {
            // TODO save transes
        });
        
        this.savingInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString(); */
        //this.tables.refresh(this.employeeList);
    }
}
