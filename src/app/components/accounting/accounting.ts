import {Component} from '@angular/core';
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {AsyncRoute} from "@angular/router-deprecated";
import {UniRouterOutlet} from "../../uniRouterOutlet";

const ACCOUNTING_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/journalentry/...',
        name: 'JournalEntry',
        loader: () => ComponentProxy.LoadComponentAsync('JournalEntry', './app/components/accounting/journalentry/journalentry')
    }),
];

@Component({
    selector: 'uni-accounting',
    template: '<uni-router-outlet></uni-router-outlet>',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(ACCOUNTING_ROUTES)
export class UniAccounting {}