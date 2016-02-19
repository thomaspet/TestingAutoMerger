import {ComponentProxy} from "../framework/core";
import {AsyncRoute} from "angular2/router";

export var Routes = {

    login: new AsyncRoute({
        path: "/login",
        name: "Login",
        loader: () => ComponentProxy.LoadComponentAsync("Login", "./app/components/login/login")
    }),

    signup: new AsyncRoute({
        path: "/signup",
        name: "Signup",
        loader: () => ComponentProxy.LoadComponentAsync("Signup", "./app/components/login/signup")
    }),

    employeeList: new AsyncRoute({
        path: "/salary/employees",
        name: "EmployeeList",
        loader: () => ComponentProxy.LoadComponentAsync("EmployeeList", "./app/components/salary/employee/employeeList")
    }),

    employeeDetails: new AsyncRoute({
        path: "/salary/employees/:id/...",
        name: "EmployeeDetails",
        loader: () => ComponentProxy.LoadComponentAsync("EmployeeDetails", "./app/components/salary/employee/employeeDetails")
    }),

    dashboard: new AsyncRoute({
        path: "/",
        name: "Dashboard",
        loader: () => ComponentProxy.LoadComponentAsync("Dashboard", "./app/components/dashboard/dashboard")
    }),

    uniFormDemo: new AsyncRoute({
        path: "/uniformdemo",
        name: "UniFormDemo",
        loader: () => ComponentProxy.LoadComponentAsync("UniFormDemo", "./app/components/uniFormDemo/uniFormDemoComponent")
    }),

    companySettings: new AsyncRoute({
        path: "/settings/...",
        name: "Settings",
        loader: () => ComponentProxy.LoadComponentAsync("Settings", "./app/components/settings/settings")
    }),

    usertest: new AsyncRoute({
        path: "/usertest",
        name: "Usertest",
        loader: () => ComponentProxy.LoadComponentAsync("Usertest", "./app/components/usertest/usertest")
    }),

    examples: new AsyncRoute({
        path: "/examples/...",
        name: "Examples",
        loader: () => ComponentProxy.LoadComponentAsync("Examples", "./app/components/examples/examples")
    }),
    
    salarytransEmployee: new AsyncRoute({
        path: "/salary/salarytranser",
        name: "SalaryTransactionEmployeeList",
        loader: () => ComponentProxy.LoadComponentAsync("SalaryTransactionEmployeeList", "./app/components/salary/salarytrans/salarytransactionEmployeeList")
    }),
    
    salarytransSelection: new AsyncRoute({
        path: "/salary/salarytrans",
        name: "SalaryTransactionSelectionList",
        loader: () => ComponentProxy.LoadComponentAsync("SalaryTransactionSelectionList", "./app/components/salary/salarytrans/salarytransactionSelectionList")
    })
};

export const APP_ROUTES = Object.keys(Routes).map((r: string) => Routes[r]);
