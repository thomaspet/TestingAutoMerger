import {Component, ViewChild, OnInit, Input} from '@angular/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {SalaryTransactionEmployeeList} from './salarytransList';
import {SalarytransFilter} from './salarytransFilter';
import {UniHttp} from '../../../../framework/core/http/http';
import {PayrollRun, Employee} from '../../../unientities';
import {EmployeeService} from '../../../services/services';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs/Observable';
declare var _;

@Component({
    selector: 'salarytrans',
    templateUrl: 'app/components/salary/salarytrans/salarytransactionSelectionList.html',
    directives: [UniTable, SalaryTransactionEmployeeList, SalarytransFilter],
    providers: [EmployeeService]
})

export class SalaryTransactionSelectionList implements OnInit {
    private salarytransSelectionTableConfig: UniTableBuilder;
    private selectedEmployeeID: number;
    @Input() private selectedPayrollRun: PayrollRun;
    private disableFilter: boolean;
    private bankaccountCol: UniTableColumn;
    private taxcardCol: UniTableColumn;
    private employeeList: Employee[] = [];
    public busy: boolean;
    @ViewChild(UniTable) private tables: UniTable;
    
    constructor(private uniHttpService: UniHttp,
                private tabSer: TabService,
                private _employeeService: EmployeeService) {
    }
    
    public ngOnInit() {
        this.selectedPayrollRun.StatusCode < 1 ? this.disableFilter = false : this.disableFilter = true;
        this.tableConfig();
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
                    .setEditable(false)
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
    
    public changeFilter(filter: string) {
        this.tableConfig(true, filter);
        this.selectedEmployeeID = 0;
    }
    
    public saveRun(event: any) {
    }
}
