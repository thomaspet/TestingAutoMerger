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
    employments:any[];
    @Input() ansattID: number;
    @ViewChildren(UniTable) tables: any;
    
    constructor(public employeeDS: EmployeeDS, private Injector: Injector, private uniHttpService: UniHttp) {
        if(!this.ansattID) {
            let params = this.Injector.parent.parent.get(RouteParams);
            this.ansattID = params.get("id");
            console.log("ansattID satt til ", this.ansattID);
        }
    }
    
    ngOnInit() {
        this.uniHttpService.asGET()
        .usingBusinessDomain()
        .withEndPoint("employments")
        .send()
        .subscribe((response) => {
            this.employments = response;
            this.createTableConfig();
        });
        //this.createTableConfig();   
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
        //var idCol = new UniTableColumn("ID","ID","number");
        var wagetypeidCol = new UniTableColumn("Wagetype.WageTypeNumber","Lønnsart","string");
        var wagetypenameCol = new UniTableColumn("Text","Tekst","string");
        var fromdateCol = new UniTableColumn("FromDate","Fra dato","date")
        var toDateCol = new UniTableColumn("ToDate","Til dato","date");
        var rateCol = new UniTableColumn("Rate","Sats","number");
        var amountCol = new UniTableColumn("Amount","Antall","number");
        var sumCol = new UniTableColumn("Sum","Beløp","number");
        var employmentidCol = new UniTableColumn("EmploymentID","Arbeidsforhold")
        .setTemplate((dataItem) => {
            return this.getEmploymentName(dataItem.EmploymentID);
        });
        var accountCol = new UniTableColumn("Account","Konto","string");
        var payoutCol = new UniTableColumn("Wagetype.Base_Payment","Utbetales","bool");
        var transtypeCol = new UniTableColumn("IsRecurringPost","Fast/Variabel post","bool")
        .setTemplate((dataItem) => {
            if(dataItem.IsRecurringPost) {
                return "Fast";
            } else {
                return "Variabel";
            }
        });
        
        this.salarytransEmployeeTableConfig = new UniTableBuilder("salarytrans",true)
        .setExpand("Wagetype")
        .setFilter("EmployeeNumber eq " + this.ansattID)
        .addColumns(
            //idCol
            //, wagetypeidCol
            //, 
            wagetypenameCol
            , employmentidCol
            , fromdateCol 
            , toDateCol
            , accountCol
            , rateCol 
            , amountCol
            , sumCol
            //, payoutCol
            , transtypeCol
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
    
    getEmploymentName = (employmentID:number) => {
        var name = "";
        for (var i = 0; i < this.employments.length; i++) {
            var employment = this.employments[i];
            if(employment.ID === employmentID) {
                name = employment.JobName;
                break;
            }
        }
        return name;
    }
}