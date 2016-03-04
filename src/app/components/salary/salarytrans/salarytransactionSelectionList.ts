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
        //console.log(filter);
        this.tables.toArray()[0].updateFilter(filter);
    }
    
    createTableConfig() {
        var idCol = new UniTableColumn("ID","ID","number");
        var employeenumberCol = new UniTableColumn("EmployeeNumber","Ansattnr.","number");
        var nameCol = new UniTableColumn("BusinessRelationInfo.Name","Navn","string");
        var bankaccountCol = new UniTableColumn("BankAccounts[0].AccountNumber","Bankkonto","string");
        var taxcardCol = new UniTableColumn("TaxTable","Skattekort","bool");
        var forpayoutCol = new UniTableColumn("Pay","Beløp til utbetaling","number");
        var localizationCol = new UniTableColumn("Localization.BusinessRelationInfo.Name","Lokasjon","string");
        var leaveCol = new UniTableColumn("Leave","Permisjon","datetime");
        var bankaccounts = new UniTableColumn("BankAccounts","kontoer","string");
        
        this.salarytransSelectionTableConfig = new UniTableBuilder("employees",false)
        .setExpand("BusinessRelationInfo,Localization.BusinessRelationInfo,BankAccounts")
        .setSelectCallback((selEmp) => {
            this.selectedEmployeeID = selEmp.EmployeeNumber;
            console.log("ansatt", selEmp);
        })
        .addColumns(idCol, employeenumberCol, 
            nameCol, 
            //bankaccountCol,
            taxcardCol, forpayoutCol, 
            localizationCol,
            bankaccounts, 
            leaveCol);
    }
}