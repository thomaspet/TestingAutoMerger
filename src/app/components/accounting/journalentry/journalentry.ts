import {Component} from "angular2/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router} from "angular2/router";

import {ComponentProxy} from "../../../../framework/core";
import {AsyncRoute} from "angular2/router";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

const BASE_JOURNALENTRY = './app/components/accounting/journalentry';

const JOURNALENTRY_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/manual',
        name: 'Bilagsregistrering',
        loader: () => ComponentProxy.LoadComponentAsync('JournalEntryManual', `${BASE_JOURNALENTRY}/journalentrymanual/journalentrymanual`)
    }),
    new AsyncRoute({
        path: '/payments',
        name: 'Betaling',
        loader: () => ComponentProxy.LoadComponentAsync('Payments', `${BASE_JOURNALENTRY}/payments/payments`)
    }),
    new AsyncRoute({
        path: '/supplierinvoices',
        name: 'Leverandørfaktura',
        loader: () => ComponentProxy.LoadComponentAsync('Payments', `${BASE_JOURNALENTRY}/supplierinvoices/supplierinvoice`)
    }),
    new AsyncRoute({
        path: '/supplierinvoices/:id',
        name: 'SupplierInvoiceDetail',
        loader: () => ComponentProxy.LoadComponentAsync('Payments', `${BASE_JOURNALENTRY}/supplierinvoices/supplierinvoicedetail`)
    })
];

@Component({
    selector: "journal-entry",
    templateUrl: "app/components/accounting/journalentry/journalentry.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(JOURNALENTRY_ROUTES)
export class JournalEntry {

    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({ name: "Bilagsregistrering", url: "/accounting/journalentry/manual" });

        //Remove last route
        this.childRoutes = JOURNALENTRY_ROUTES.slice(0,JOURNALENTRY_ROUTES.length-1);
    }
}
