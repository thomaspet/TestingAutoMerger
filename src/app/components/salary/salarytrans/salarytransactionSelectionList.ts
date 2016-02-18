import {Component} from "angular2/core";
import {Router, RouteConfig} from "angular2/router";
import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../framework/uniTable";

@Component({
    templateUrl: "app/components/salary/salarytransaction/salarytransactionSelectionList.html",
    directives: [UniTable]
})

export class SalaryTransactionEmployeeList {
    salarytransSelectionTableConfig;
    someSortOfDataSource: any;
    
    constructor(router: Router) {
        var idCol = new UniTableColumn("ID","ID","number");
        var employeenumberCol = new UniTableColumn("Employee","Ansattnr.","number");
        var nameCol = new UniTableColumn("Name","Navn","string");
        var bankaccountCol = new UniTableColumn("Account","Bankkonto","string");
        var taxcardCol = new UniTableColumn("Tax","Skattekort","bool");
        var forpayoutCol = new UniTableColumn("Pay","Beløp til utbetaling","number");
        var localizationCol = new UniTableColumn("Location","Lokasjon","string");
        var leaveCol = new UniTableColumn("Leave","Permisjon","datetime");
        
        this.someSortOfDataSource = [
          {ID: 1, Employee: 1, Name: "Ben", Account: "1234.56.78910", Tax: true, Pay: 90, Location: "Stadt", Leave: ""},
          {ID: 2, Employee: 20, Name: "Arild", Account: "1111.22.33333", Tax: true, Pay: 1000000, Location: "Bergen", Leave: "01.01.2016 - 31.03.2016"},
          {ID: 3, Employee: 33, Name: "Sondre", Account: "0198.76.54321", Tax: false, Pay: 150, Location: "Modalen", Leave: ""},
          {ID: 4, Employee: 49, Name: "Vibeke", Account: "4444.55.66666", Tax: false, Pay: 6879, Location: "Modalen", Leave: ""},  
        ];
        
        this.salarytransSelectionTableConfig = new UniTableBuilder(this.someSortOfDataSource,false)
        .addColumns(idCol, employeenumberCol, nameCol, 
            bankaccountCol, taxcardCol, forpayoutCol, localizationCol, leaveCol);
    }
}