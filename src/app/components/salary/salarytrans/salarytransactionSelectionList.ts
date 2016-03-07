import {Component, Input, ViewChildren, ViewChild} from "angular2/core";
import {Router, RouteConfig} from "angular2/router";
import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../framework/uniTable";
import {SalaryTransactionEmployeeList} from "./salarytransactionEmployeeList";
import {SalarytransFilter} from "./salarytransFilter";

@Component({
    templateUrl: "app/components/salary/salarytrans/salarytransactionSelectionList.html",
    directives: [UniTable, SalaryTransactionEmployeeList, SalarytransFilter]
})

export class SalaryTransactionSelectionList {
    salarytransSelectionTableConfig;
    selectedEmployeeID:number;
    @ViewChildren(UniTable) tables: any;
    
    constructor() {
        this.createTableConfig();
    }
    
    changeFilter(filter: string) {
        this.tables.toArray()[0].updateFilter(filter);
        this.selectedEmployeeID = 0;
    }
    
    createTableConfig() {
        var idCol = new UniTableColumn("ID","ID","number");
        var employeenumberCol = new UniTableColumn("EmployeeNumber","Ansattnr.","number");
        var nameCol = new UniTableColumn("BusinessRelationInfo.Name","Navn","string");
        var bankaccountCol = new UniTableColumn("BankAccounts","Bankkonto","object")
        .setTemplate((dataItem) => {
            return this.getStandardBankAccountNumber(dataItem.BankAccounts);
        });
        var taxcardCol = new UniTableColumn("TaxTable","Skattekort","bool");
        var forpayoutCol = new UniTableColumn("Pay","Beløp til utbetaling","number");
        var localizationCol = new UniTableColumn("Localization.BusinessRelationInfo.Name","Lokasjon","string");
        var leaveCol = new UniTableColumn("Leave","Permisjon","datetime");
        this.salarytransSelectionTableConfig = new UniTableBuilder("employees",false)
        .setExpand("BusinessRelationInfo,Localization.BusinessRelationInfo,BankAccounts")
        .setSelectCallback((selEmp) => {
            this.selectedEmployeeID = selEmp.EmployeeNumber;
        })
        .addColumns(
            idCol
            ,employeenumberCol
            ,nameCol 
            ,bankaccountCol
            ,taxcardCol
            ,localizationCol
            ,forpayoutCol
            //,leaveCol
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