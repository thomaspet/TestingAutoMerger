import {ComponentProxy} from "../framework/core";
import {AsyncRoute} from "angular2/router";

export const Routes = [
    new AsyncRoute({
        path: "/login",
        name: "Login",
        loader: () => ComponentProxy.LoadComponentAsync("Login", "./app/components/login/login")
    }),

    new AsyncRoute({
        path: "/signup",
        name: "Signup",
        loader: () => ComponentProxy.LoadComponentAsync("Signup", "./app/components/login/signup")
    }),

    new AsyncRoute({
        path: "/",
        name: "Dashboard",
        loader: () => ComponentProxy.LoadComponentAsync("Dashboard", "./app/components/dashboard/dashboard")
    }),

    new AsyncRoute({
        path: "/salary/...",
        name: "UniSalary",
        loader: () => ComponentProxy.LoadComponentAsync("UniSalary", "./app/components/salary/routes")
    }),

    new AsyncRoute({
        path: "/uniformdemo",
        name: "UniFormDemo",
        loader: () => ComponentProxy.LoadComponentAsync("UniFormDemo", "./app/components/uniFormDemo/uniFormDemoComponent")
    }),

    new AsyncRoute({
        path: "/settings/...",
        name: "Settings",
        loader: () => ComponentProxy.LoadComponentAsync("Settings", "./app/components/settings/settings")
    }),

    new AsyncRoute({
        path: "/journalentry/...",
        name: "JournalEntry",
        loader: () => ComponentProxy.LoadComponentAsync("JournalEntry", "./app/components/accounting/journalentry/journalentry")
    }),     
    
    new AsyncRoute({
        path: "/usertest",
        name: "Usertest",
        loader: () => ComponentProxy.LoadComponentAsync("Usertest", "./app/components/usertest/usertest")
    }),

    new AsyncRoute({
        path: "/examples/...",
        name: "Examples",
        loader: () => ComponentProxy.LoadComponentAsync("Examples", "./app/components/examples/examples")
    })
];
