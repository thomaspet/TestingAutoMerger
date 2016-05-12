import {Component} from '@angular/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from "@angular/router-deprecated";

import {SupplierInvoice} from '../../../../unientities';

import {ComponentProxy} from "../../../../../framework/core/componentProxy";

const INVOICE_ROUTES = [
    new AsyncRoute({  
        useAsDefault: true,      
        path: "/list",
        name: "SupplierInvoiceList", 
        loader: () => ComponentProxy.LoadComponentAsync("SupplierInvoiceList", "./app/components/accounting/journalentry/supplierinvoices/supplierinvoicelist")
    }),
    new AsyncRoute({
        path: "/details/:id",
        name: "SupplierInvoiceDetail",
        loader: () => ComponentProxy.LoadComponentAsync("SupplierInvoiceDetail", "./app/components/accounting/journalentry/supplierinvoices/supplierinvoicedetail")
    })
];

@Component({
    selector: 'supplier-invoices',
    templateUrl: 'app/components/accounting/journalentry/supplierinvoices/supplierinvoices.html',
    directives: [ROUTER_DIRECTIVES]    
})
@RouteConfig(INVOICE_ROUTES)
export class SupplierInvoices {
    childRoutes: RouteDefinition[];

    constructor(public router: Router) {
        this.childRoutes = INVOICE_ROUTES.slice(0, INVOICE_ROUTES.length - 1);
        
        
    }
}
