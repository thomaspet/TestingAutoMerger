import {Component} from "angular2/core";
import {Router, RouteConfig} from "angular2/router";
import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../framework/uniTable";
import {SalaryTransactionEmployeeList} from "./salarytransactionEmployeeList";

@Component({
    templateUrl: "app/components/salary/salarytrans/salarytransactionSelectionList.html",
    directives: [UniTable, SalaryTransactionEmployeeList]
})

export class SalaryTransactionSelectionList {
    salarytransSelectionTableConfig;
    selectedEmployeeID:number;
    
    constructor(router: Router) {
        this.createTableConfig();
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
        
        this.salarytransSelectionTableConfig = new UniTableBuilder("employees",false)
        .setExpand("BusinessRelationInfo,Localization.BusinessRelationInfo,BankAccounts")
        .setFilter("BusinessRelationID gt 0")
        .setSelectCallback((selEmp) => {
            this.selectedEmployeeID = selEmp.EmployeeNumber;
            console.log("valgt ansattID", this.selectedEmployeeID);
            console.log("ansatt valgt",selEmp);
        })
        .addColumns(idCol, employeenumberCol, 
            nameCol, 
            //bankaccountCol, 
            taxcardCol, forpayoutCol, 
            //localizationCol, 
            leaveCol);
    }
}