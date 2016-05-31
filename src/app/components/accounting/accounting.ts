import {Component} from '@angular/core';
import {RouteConfig, ROUTER_DIRECTIVES, AsyncRoute} from "@angular/router-deprecated";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {UniRouterOutlet} from "../../uniRouterOutlet";

const ACCOUNTING_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/journalentry/...',
        name: 'JournalEntry',
        loader: () => ComponentProxy.LoadComponentAsync('JournalEntry', 'src/app/components/accounting/journalentry/journalentry')
    }),
    new AsyncRoute({
        path: '/transquery/...',
        name: 'Transquery',
        loader: () => ComponentProxy.LoadComponentAsync('Transquery', 'src/app/components/accounting/transquery/transquery')
    })
];

@Component({
    selector: 'uni-accounting',
    template: '<uni-router-outlet></uni-router-outlet>',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(ACCOUNTING_ROUTES)
export class UniAccounting {}