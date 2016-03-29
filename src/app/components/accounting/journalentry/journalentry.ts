import {Component} from "angular2/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router} from "angular2/router";

import {ComponentProxy} from "../../../../framework/core";
import {AsyncRoute} from "angular2/router";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {JournalEntryManual} from './journalentrymanual/journalentrymanual';
import {Payments} from './payments/payments';
import {SupplierInvoices} from './supplierinvoices/supplierinvoices';
import {SupplierInvoiceDetail} from './supplierinvoices/supplierinvoicedetail';

const CHILD_ROUTES = [
    {path: '/', redirectTo: ['JournalEntryManual']},
    {path: '/manual', component: JournalEntryManual, as: 'Bilagsregistrering'},
    {path: '/payments', component: Payments, as: 'Betaling'},
    {path: '/supplierinvoices', component: SupplierInvoices, as: 'Leverandørfaktura' },
    {path: '/supplierinvoices/:id', component: SupplierInvoiceDetail, as: 'SupplierInvoiceDetail'}
];

@Component({
    selector: "journal-entry",
    templateUrl: "app/components/accounting/journalentry/journalentry.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(CHILD_ROUTES)
export class JournalEntry {

    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({ name: "Bilagsregistrering", url: "/accounting/journalentry" });
        this.childRoutes = CHILD_ROUTES.slice(1, CHILD_ROUTES.length-1); 
        // we dont want the redirect route in our navigation
    }

    ngOnInit() {

    }
}
