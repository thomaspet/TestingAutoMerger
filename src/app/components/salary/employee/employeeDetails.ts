import {Component, provide} from "angular2/core";
import {RouteConfig, RouteDefinition, RouteParams, ROUTER_DIRECTIVES} from "angular2/router";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";

import {PersonalDetails} from "./personalDetails/personalDetails";
import {EmployeeEmployment} from "./employments/employments";
import {Hours} from "./hours/hours";
import {Travel} from "./travel/travel";
import {SalaryTransactions} from "./salaryTransactions/salaryTransactions";
import {EmployeeLeave} from "./employeeLeave/employeeLeave";

import {UniTabs} from "../../layout/uniTabs/uniTabs";
import {WidgetPoster} from "../../../../framework/widgetPoster/widgetPoster";

import {EmployeeDS} from "../../../data/employee";
import {STYRKCodesDS} from "../../../data/styrkCodes";

const CHILD_ROUTES = [
    {path: "/", component: PersonalDetails, as: "PersonalDetails"},
    {path: "/employment", component: EmployeeEmployment, as: "Employment"},
    {path: "/salarytransactions", component: SalaryTransactions, as: "SalaryTransactions"},
    {path: "/hours", component: Hours, as: "Hours"},
    {path: "/travel", component: Travel, as: "Travel"},
    {path: "/employeeleave", component: EmployeeLeave, as: "EmployeeLeave"}
];

@Component({
    selector: "uni-employee-details",
    templateUrl: "app/components/salary/employee/employeeDetails.html",
    providers: [provide(EmployeeDS, {useClass: EmployeeDS}), provide(STYRKCodesDS, {useClass: STYRKCodesDS})],
    directives: [ROUTER_DIRECTIVES, WidgetPoster, UniTabs]
})

@RouteConfig(CHILD_ROUTES)
export class EmployeeDetails {
    employee; // any = {};
    // empJSON;
    childRoutes: RouteDefinition[];
    localizations;

    constructor(private routeParams: RouteParams, private employeeDS: EmployeeDS) {
        this.childRoutes = CHILD_ROUTES;
    }

    ngOnInit() {
        var employeeID = this.routeParams.get("id");
        Observable.forkJoin(
            this.employeeDS.get(employeeID),
            this.employeeDS.getLocalizations()
        ).subscribe((response: any) => {
            let [emp, loc] = response;
            this.employee = emp;
            this.localizations = loc;

            //console.log("employee", response);
            
        }, error => console.log(error));
    }

    onFormSubmit(value) {
        console.log(value);
    }

}