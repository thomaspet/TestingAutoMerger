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
import {CustomerAdd} from './customer/add/customerAdd';
import {CustomerDetails} from './customer/customerDetails/customerDetails';
import {CustomerList} from './customer/list/customerList';
import {InvoiceItemList} from './invoice/details/invoiceItemList';
import {InvoiceDetails} from './invoice/details/invoiceDetails';
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
import {UniSales} from "./sales";

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
        CustomerAdd,
        CustomerDetails,
        CustomerList,
        InvoiceList,
        InvoiceItemList,
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
    ],
    providers: [
        TradeItemHelper
    ],
    exports: [
        UniSales,
        Customer,
        CustomerAdd,
        CustomerDetails,
        CustomerList,
        InvoiceList,
        InvoiceItemList,
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
