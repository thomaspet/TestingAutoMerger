import {Component, Input, ViewChildren, ViewChild} from "angular2/core";
import {Router, RouteConfig} from "angular2/router";
import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../framework/uniTable";
import {SalaryTransactionEmployeeList} from "./salarytransList";
import {SalarytransFilter} from "./salarytransFilter";
import {UniHttp} from "../../../../framework/core/http/http";
import {TabService} from '../../layout/navbar/tabstrip/tabService';

@Component({
    templateUrl: "app/components/salary/salarytrans/salarytransactionSelectionList.html",
    directives: [UniTable, SalaryTransactionEmployeeList, SalarytransFilter]
})

export class SalaryTransactionSelectionList {
    salarytransSelectionTableConfig;
    selectedEmployeeID:number;
    selectedPayrollRunID:number;
    payrollRun;
    @ViewChildren(UniTable) tables: any;
    
    constructor(private uniHttpService: UniHttp,
        private tabSer: TabService) {
        this.uniHttpService.asGET()
        .usingBusinessDomain()
        .withEndPoint("payrollrun/1")
        .send()
        .subscribe((response) => {
            this.payrollRun = response;
            this.selectedPayrollRunID = this.payrollRun.ID;
            this.createTableConfig();
        });
     
        this.tabSer.addTab({name: 'Transaksjoner', url: '/salary/salarytrans'});   
    }
    
    changeFilter(filter: string) {
        this.tables.toArray()[0].updateFilter(filter);
        this.selectedEmployeeID = 0;
    }
    
    createTableConfig() {
        var employeenumberCol = new UniTableColumn("EmployeeNumber","Ansattnr.","number");
        var nameCol = new UniTableColumn("BusinessRelationInfo.Name","Navn","string");
        var bankaccountCol = new UniTableColumn("BankAccounts","Bankkonto")
        .setTemplate((dataItem) => {
            return this.getStandardBankAccountNumber(dataItem.BankAccounts);
        });
        var taxcardCol = new UniTableColumn("TaxTable","Skattekort","string");
        var forpayoutCol = new UniTableColumn("Pay","Beløp til utbetaling","number");
        var subEntityCol = new UniTableColumn("SubEntity.BusinessRelationInfo.Name","Virksomhet","string");
        this.salarytransSelectionTableConfig = new UniTableBuilder("employees",false)
        .setExpand("BusinessRelationInfo,SubEntity.BusinessRelationInfo,BankAccounts")
        .setSelectCallback((selEmp) => {
            this.selectedEmployeeID = selEmp.EmployeeNumber;
        })
        .addColumns(
            employeenumberCol
            ,nameCol 
            ,bankaccountCol
            ,taxcardCol
            ,subEntityCol
            ,forpayoutCol
            );
    }
    
    getStandardBankAccountNumber(bankAccounts:any) {
        var bAccount = "";
        for (var i = 0; i < bankAccounts.length; i++) {
            var bankAccount = bankAccounts[i];
            if(bankAccount.Active === true) {
                bAccount = bankAccount.AccountNumber;
            }
        }
        return bAccount;
    }
}