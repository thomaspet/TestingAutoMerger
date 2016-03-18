import {Component} from "angular2/core";
import {Router, RouteConfig, ROUTER_DIRECTIVES} from "angular2/router";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {AsyncRoute} from "angular2/router";
import {Redirect} from "angular2/router";
import {UniRouterOutlet} from "../../uniRouterOutlet";

const SALARY_ROUTES = [
    new AsyncRoute({
        path: "salarytrans",
        name: "SalaryTransactionSelectionList",
        loader: () => ComponentProxy.LoadComponentAsync("SalaryTransactionSelectionList", "./app/components/salary/salarytrans/salarytransactionSelectionList")
    }),
    new AsyncRoute({
        path: "/wagetypes/:id",
        name: "WageTypeDetail",
        loader: () => ComponentProxy.LoadComponentAsync("WagetypeDetail", "./app/components/salary/wagetype/wagetypeDetails")
    }),
    new AsyncRoute({
        path: "/wagetypes",
        name: "WagetypeList",
        loader: () => ComponentProxy.LoadComponentAsync("WagetypeList", "./app/components/salary/wagetype/wagetypeList")
    }),
    new AsyncRoute({
        path: "/employees",
        name: "EmployeeList",
        useAsDefault: true,
        loader: () => ComponentProxy.LoadComponentAsync("EmployeeList", "./app/components/salary/employee/employeeList")
    }),
    new AsyncRoute({
        path: "/employees/:id/...",
        name: "EmployeeDetails",
        loader: () => ComponentProxy.LoadComponentAsync("EmployeeDetails", "./app/components/salary/employee/employeeDetails")
    }),
];

@Component({
    selector: 'uni-salary',
    template: '<uni-router-outlet></uni-router-outlet>',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(SALARY_ROUTES)
export class UniSalary {}

