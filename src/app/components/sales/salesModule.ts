import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {AppServicesModule} from '../../services/servicesModule';
import {routes as SalesRoutes} from './salesRoutes';
import {Customer} from './customer/customer';
import {CustomerDetails} from './customer/customerDetails/customerDetails';
import {CustomerList} from './customer/list/customerList';
import {ReportsModule} from '../reports/reportsModule';
import {InvoiceList} from './invoice/list/invoiceList';
import {OrderDetails} from './order/details/orderDetails';
import {TradeItemHelper} from './salesHelper/TradeItemHelper';
import {OrderItemList} from './order/details/orderItemList';
import {OrderList} from './order/list/orderList';
import {OrderToInvoiceTable} from './order/modals/ordertoinvoice';
import {OrderToInvoiceModalType} from './order/modals/ordertoinvoice';
import {OrderToInvoiceModal} from './order/modals/ordertoinvoice';
import {QuoteDetails} from './quote/details/quoteDetails';
import {QuoteItemList} from './quote/details/quoteItemList';
import {QuoteList} from './quote/list/quoteList';
import {SupplierDetailsModal} from './supplier/details/supplierDetailModal';
import {SupplierDetails} from './supplier/details/supplierDetails';
import {SupplierList} from './supplier/list/supplierList';
import {UniTableModule} from 'unitable-ng2/main';
import {UniSales} from './sales';

import {InvoiceDetails} from './invoice/details/invoice';
import {InvoiceItems} from './invoice/details/invoiceitems';
import {InvoiceDetailsForm} from './invoice/details/tabContent/detailsForm';
import {InvoiceDeliveryForm} from './invoice/details/tabContent/deliveryForm';
import {CustomerCard} from './invoice/details/customerCard';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // Unitable
        UniTableModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        AppServicesModule,
        ReportsModule,

        // Route module
        SalesRoutes
    ],
    declarations: [
        UniSales,
        Customer,
        CustomerDetails,
        CustomerList,
        InvoiceList,
        InvoiceDetails,
        InvoiceItems,
        // Invoice tab-views
        InvoiceDetailsForm,
        InvoiceDeliveryForm,
        CustomerCard,

        OrderItemList,
        OrderDetails,
        OrderList,
        OrderToInvoiceTable,
        OrderToInvoiceModalType,
        OrderToInvoiceModal,
        QuoteDetails,
        QuoteItemList,
        QuoteList,
        SupplierDetailsModal,
        SupplierDetails,
        SupplierList
    ],
    entryComponents: [
        OrderToInvoiceModalType,
        OrderToInvoiceTable
    ],
    providers: [
        TradeItemHelper
    ],
    exports: [
        UniSales,
        Customer,
        CustomerDetails,
        CustomerList,
        InvoiceList,
        InvoiceDetails,
        OrderItemList,
        OrderDetails,
        OrderList,
        OrderToInvoiceTable,
        OrderToInvoiceModalType,
        OrderToInvoiceModal,
        QuoteDetails,
        QuoteItemList,
        QuoteList,
        SupplierDetailsModal,
        SupplierDetails,
        SupplierList
    ]
})
export class SalesModule {
}
