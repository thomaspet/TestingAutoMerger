import {Component, Input, ViewChildren, provide} from "angular2/core";
import {Router, RouteConfig} from "angular2/router";
import {UniTable, UniTableBuilder, UniTableColumn} from "../../../../framework/uniTable";
import {Observable} from "rxjs/Observable";
import {UniHttp} from "../../../../framework/core/http";
import {EmployeeDS} from "../../../../framework/data/employee";

@Component({
    selector: "salary-transactions-employee",
    templateUrl: "app/components/salary/salarytrans/salarytransactionEmployeeList.html",
    directives: [UniTable],
    providers: [provide(EmployeeDS, {useClass: EmployeeDS})]
})

export class SalaryTransactionEmployeeList {
    salarytransEmployeeTableConfig;
    salarytransEmployeeTotalsTableConfig;
    employeeTotals: Array<any>;
    @Input() ansattID: number;
    @ViewChildren(UniTable) tables: any;
    
    constructor(public employeeDS: EmployeeDS) {
        
    }
    
    ngOnInit() {
        this.createTableConfig();   
        this.createTotalTableConfig(); 
    }
    
    ngOnChanges() {
        console.log("onChange: ansattID",this.ansattID);
        if(this.tables && this.ansattID) {
            this.tables.toArray()[0].updateFilter('EmployeeNumber eq ' + this.ansattID);
            Observable.forkJoin(
                this.employeeDS.getTotals(this.ansattID)
            ).subscribe((response: any) => {
                let [totals] = response;
                this.employeeTotals = totals;
                console.log("totals",totals);
                this.calculateTotals(totals);
                //this.createTotalTableConfig();
                
            }, (error: any) => console.log(error));
        }
    }
    
    createTableConfig() {
        var idCol = new UniTableColumn("ID","ID","number");
        var wagetypeidCol = new UniTableColumn("Wagetype.WageTypeId","Lønnsart","number");
        var wagetypenameCol = new UniTableColumn("Text","Tekst","string");
        var fromdateCol = new UniTableColumn("FromDate","Dato fra-til","datetime")
        .setFormat("{0: dd.MM.yyyy}");
        var rateCol = new UniTableColumn("Rate","Sats","number");
        var amountCol = new UniTableColumn("Amount","Antall","number");
        var sumCol = new UniTableColumn("Sum","Beløp","number");
        var employmentidCol = new UniTableColumn("EmploymentID","Arb.forhold ID","number");
        var accountCol = new UniTableColumn("account","Konto","string");
        // var payoutCol = new UniTableColumn("wagetype.base_payment","Utbetales","bool");
        var transtypeCol = new UniTableColumn("","Fast/Variabel post","string");
        
        this.salarytransEmployeeTableConfig = new UniTableBuilder("salarytrans",true)
        //.setExpand("Wagetype")
        .setFilter("EmployeeNumber eq " + this.ansattID)
        .addColumns(idCol
            //, wagetypeidCol
            , wagetypenameCol
            , fromdateCol 
            , rateCol 
            , amountCol, sumCol, employmentidCol, 
            accountCol, 
            //payoutCol, 
            transtypeCol
            );
    }
    
    calculateTotals(totals) {
        var tmp: Array<any> = [
            {Percent:"", Table:"", Paid:0, Aga:0, Vacation:0}
        ];
        
        totals.forEach(element => {
            console.log("element",element);
            tmp[0].Percent += element.Percent;
            tmp[0].Table += element.ID;
            tmp[0].Paid += element.Sum;
            tmp[0].Aga += element.Rate;
            tmp[0].Vacation += element.Amount;
        });
        console.log("tmp",tmp);
        
        this.employeeTotals = totals;
        this.tables.toArray()[1].refresh(this.employeeTotals);
    }
    
    createTotalTableConfig() {
        var percentCol = new UniTableColumn("Percent","Prosenttrekk","string");
        var taxtableCol = new UniTableColumn("Table","Tabelltrekk","string");
        var paidCol = new UniTableColumn("Paid","Utbetalt beløp","number");
        var agaCol = new UniTableColumn("Aga","Beregnet AGA", "number");
        var basevacationCol = new UniTableColumn("Vacation","Grunnlag feriepenger","number"); 
        
        this.salarytransEmployeeTotalsTableConfig = new UniTableBuilder(this.employeeTotals,false)
        .addColumns(percentCol, taxtableCol, paidCol, agaCol, basevacationCol);
    }
    
}