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
    //allEmployees;
    selectedEmployeeID:number;
    
    constructor(router: Router) {
        this.createTableConfig();
    }
    
    createTableConfig() {
        var idCol = new UniTableColumn("ID","ID","number");
        var employeenumberCol = new UniTableColumn("EmployeeNumber","Ansattnr.","number");
        var nameCol = new UniTableColumn("BusinessRelationInfo.Name","Navn","string");
        //var bankaccountCol = new UniTableColumn("BankAccounts[0].AccountNumber","Bankkonto","string");
        var taxcardCol = new UniTableColumn("TaxTable","Skattekort","bool");
        var forpayoutCol = new UniTableColumn("Pay","Beløp til utbetaling","number");
        //var localizationCol = new UniTableColumn("Localization.BusinessRelationInfo.Name","Lokasjon","string");
        var leaveCol = new UniTableColumn("Leave","Permisjon","datetime");
        
        // this.allEmployees = [
        //   {ID: 1, Employee: 1, Name: "Ben", Account: "1234.56.78910", Tax: true, Pay: 90, Location: "Stadt", Leave: ""},
        //   {ID: 2, Employee: 20, Name: "Arild", Account: "1111.22.33333", Tax: true, Pay: 1000000, Location: "Bergen", Leave: "01.01.2016 - 31.03.2016"},
        //   {ID: 3, Employee: 33, Name: "Sondre", Account: "0198.76.54321", Tax: false, Pay: 150, Location: "Modalen", Leave: ""},
        //   {ID: 4, Employee: 49, Name: "Vibeke", Account: "4444.55.66666", Tax: false, Pay: 6879, Location: "Modalen", Leave: ""},  
        // ];
        
        //this.salarytransSelectionTableConfig = new UniTableBuilder(this.allEmployees,false)
        this.salarytransSelectionTableConfig = new UniTableBuilder("employees",false)
        .setExpand("BusinessRelationInfo")
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