import {Component} from "angular2/core";
import {Router, RouteConfig} from "angular2/router";
import {UniTable} from "../../../../framework/uniTable";

@Component({
    templateUrl: "app/components/salary/salarytransaction/salarytransaction.html",
    directives: [UniTable]
})

export class SalaryTransaction {
    salarytransactionTableConfig;
    
    constructor(router: Router) {
        
    }
}