import {Component} from '@angular/core';
import {RouteConfig, ROUTER_DIRECTIVES, AsyncRoute} from "@angular/router-deprecated";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {UniRouterOutlet} from "../../uniRouterOutlet";

const ACCOUNTING_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/journalentry/...',
        name: 'JournalEntry',
        loader: () => ComponentProxy.LoadComponentAsync('JournalEntry','app/components/accounting/journalentry/journalentry')
    }),
    new AsyncRoute({
        path: '/transquery/...',
        name: 'Transquery',
        loader: () => ComponentProxy.LoadComponentAsync('Transquery','app/components/accounting/transquery/transquery')
    })
    ,
    new AsyncRoute({
        path: '/accountsettings',
        name: 'AccountSettings',
        loader: () => ComponentProxy.LoadComponentAsync('AccountSettings','app/components/settings/accountSettings/accountSettings')
    })
    ,
    new AsyncRoute({
        path: '/vatsettings',
        name: 'VatSettings',
        loader: () => ComponentProxy.LoadComponentAsync('VatSettings','app/components/settings/vatsettings/vatsettings')
    }),
    new AsyncRoute({
        path: '/vatreport/...',
        name: 'VatReport',
        loader: () => ComponentProxy.LoadComponentAsync('VatReport', 'app/components/accounting/vatreport/vatreport')
    })
];

@Component({
    selector: 'uni-accounting',
    template: '<uni-router-outlet></uni-router-outlet>',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(ACCOUNTING_ROUTES)
export class UniAccounting {}