import {Component, Input} from "angular2/core";
import {Router, RouteConfig} from "angular2/router";
import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../framework/uniTable";

@Component({
    selector: "salary-transactions-employee",
    templateUrl: "app/components/salary/salarytrans/salarytransactionEmployeeList.html",
    directives: [UniTable]
    //,inputs: ["ansattID"]
})

export class SalaryTransactionEmployeeList {
    salarytransEmployeeTableConfig;
    salarytransFilterString: string;
    @Input() ansattID: number = 0;
    
    constructor(router: Router) {
        
    }
    
    ngOnInit() {
        this.createTableConfig();
    }
    
    ngOnChanges() {
        console.log("onChange: ansattID",this.ansattID);
        //update filter in unitable
        this.salarytransFilterString = "EmployeeNumber eq " + this.ansattID;
    }
    
    createTableConfig() {
        
        //this.ansattID = ansattID;
        
        var idCol = new UniTableColumn("ID","ID","number");
        //var wagetypeidCol = new UniTableColumn("wagetype.wagetypeid","Lønnsart","number");
        //var wagetypenameCol = new UniTableColumn("text","Tekst","string");
        //var fromdateCol = new UniTableColumn("","Dato fra-til","datetime");
        var rateCol = new UniTableColumn("Rate","Sats","number");
        // var amountCol = new UniTableColumn("amount","Antall","number");
        // var sumCol = new UniTableColumn("sum","Beløp","number");
        // var employmentidCol = new UniTableColumn("employmentID","Arb.forhold ID","number");
        // var accountCol = new UniTableColumn("account","Konto","string");
        // var payoutCol = new UniTableColumn("wagetype.base_payment","Utbetales","bool");
        // var transtypeCol = new UniTableColumn("","Fast/Variabel post","string");
        
        this.salarytransEmployeeTableConfig = new UniTableBuilder("employees",false)
        //.setExpand("wagetype")
        //.setFilter("EmployeeNumber eq " + this.ansattID)
        .addColumns(idCol
            //, wagetypeidCol, wagetypenameCol, 
            //fromdateCol, 
            ,rateCol 
            //, amountCol, sumCol, employmentidCol, 
            //accountCol, payoutCol, transtypeCol
            );
    }
    
}