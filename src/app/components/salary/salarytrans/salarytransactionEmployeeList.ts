import {Component, Input, ViewChildren, provide, Injector} from "angular2/core";
import {Router, RouteConfig, RouteParams} from "angular2/router";
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
    
    constructor(public employeeDS: EmployeeDS, private Injector: Injector) {
        if(!this.ansattID) {
            let params = this.Injector.parent.parent.get(RouteParams);
            this.ansattID = params.get("id");
            console.log("ansattID satt til ", this.ansattID);
        }
    }
    
    ngOnInit() {
        this.createTableConfig();   
        Observable.forkJoin(
            this.employeeDS.getTotals(this.ansattID)
        ).subscribe((response: any) => {
            let [totals] = response;
            this.employeeTotals = totals;
            console.log("totals",totals);
            this.createTotalTableConfig();
        }, (error: any) => console.log(error));
    }
    
    ngOnChanges() {
        console.log("onChange: ansattID",this.ansattID);
        if(this.tables && this.ansattID) {
            this.tables.toArray()[0].updateFilter('EmployeeNumber eq ' + this.ansattID);
            this.calculateTotals();
        }
    }
    
    createTableConfig() {
        var idCol = new UniTableColumn("ID","ID","number");
        var wagetypeidCol = new UniTableColumn("Wagetype.WageTypeNumber","Lønnsart","number");
        var wagetypenameCol = new UniTableColumn("Text","Tekst","string");
        var fromdateCol = new UniTableColumn("FromDate","Dato fra-til","datetime")
        .setFormat("{0: dd.MM.yyyy}");
        var rateCol = new UniTableColumn("Rate","Sats","number");
        var amountCol = new UniTableColumn("Amount","Antall","number");
        var sumCol = new UniTableColumn("Sum","Beløp","number");
        var employmentidCol = new UniTableColumn("EmploymentID","Arb.forhold ID","number");
        var accountCol = new UniTableColumn("Account","Konto","string");
        var payoutCol = new UniTableColumn("Wagetype.Base_Payment","Utbetales","bool");
        var transtypeCol = new UniTableColumn("","Fast/Variabel post","string");
        
        this.salarytransEmployeeTableConfig = new UniTableBuilder("salarytrans",true)
        .setExpand("Wagetype")
        .setFilter("EmployeeNumber eq " + this.ansattID)
        .addColumns(idCol
            , wagetypeidCol
            , wagetypenameCol
            , fromdateCol 
            , rateCol 
            , amountCol
            , sumCol
            , employmentidCol
            , accountCol
            , payoutCol
            //, transtypeCol
            );
    }
    
    calculateTotals() {
        Observable.forkJoin(
            this.employeeDS.getTotals(this.ansattID)
        ).subscribe((response: any) => {
            let [totals] = response;
            this.employeeTotals = totals;
            //console.log("totals",this.employeeTotals);
            this.tables.toArray()[1].refresh(this.employeeTotals);
        }, (error: any) => console.log(error));
    }
    
    createTotalTableConfig() {
        var percentCol = new UniTableColumn("Account","Prosenttrekk","string");
        var taxtableCol = new UniTableColumn("Amount","Tabelltrekk","string");
        var paidCol = new UniTableColumn("EmployeeNumber","Utbetalt beløp","number");
        var agaCol = new UniTableColumn("Rate","Beregnet AGA", "number");
        var basevacationCol = new UniTableColumn("Sum","Grunnlag feriepenger","number"); 
        
        this.salarytransEmployeeTotalsTableConfig = new UniTableBuilder(this.employeeTotals,false)
        .addColumns(percentCol, taxtableCol, paidCol, agaCol, basevacationCol);
    }
    
}