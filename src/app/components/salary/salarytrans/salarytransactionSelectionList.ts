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
        var bankaccountCol = new UniTableColumn("BankAccounts[finn-index-til-active-og-sett-inn-her].AccountNumber","Bankkonto","string");
        var taxcardCol = new UniTableColumn("TaxTable","Skattekort","bool");
        var forpayoutCol = new UniTableColumn("Pay","Beløp til utbetaling","number");
        var localizationCol = new UniTableColumn("Localization.BusinessRelationInfo.Name","Lokasjon","string");
        var leaveCol = new UniTableColumn("Leave","Permisjon","datetime");
        var bankaccounts = new UniTableColumn("BankAccounts","kontoer","string");
        
        /*
        PERMISJON må hentes og vises basert på den ansatte og datoen for lønnskjøringen, og må muligens kunne vise fleire permisjoner. 
        select * from client1.EmployeeLeave
        where EmploymentID in (select ID from client1.Employment
        where EmployeeID = givenEmployeeNumber)
        and ((FromDate > 'givenFromDate' and FromDate <= 'givenToDate') or (ToDate > 'givenFromDate'))
        */
        
        
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