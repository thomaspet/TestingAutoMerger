import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {routes as SalesRoutes} from './salesRoutes';
import {Customer} from './customer/customer';
import {CustomerDetailsModal} from './customer/customerDetails/customerDetailsModal';
import {CustomerDetails} from './customer/customerDetails/customerDetails';
import {CustomerList} from './customer/list/customerList';
import {ReportsModule} from '../reports/reportsModule';

import {InvoiceList} from './invoice/list/invoiceList';
import {OrderDetails} from './order/details/orderDetails';
import {TradeItemHelper} from './salesHelper/tradeItemHelper';
import {OrderItemList} from './order/details/orderItemList';
import {OrderList} from './order/list/orderList';
import {OrderToInvoiceTable} from './order/modals/ordertoinvoice';
import {OrderToInvoiceModalType} from './order/modals/ordertoinvoice';
import {OrderToInvoiceModal} from './order/modals/ordertoinvoice';
import {QuoteDetails} from './quote/details/quoteDetails';
import {QuoteList} from './quote/list/quoteList';
import {SupplierDetailsModal} from './supplier/details/supplierDetailModal';
import {SupplierDetails} from './supplier/details/supplierDetails';
import {SupplierList} from './supplier/list/supplierList';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {UniSales} from './sales';
import {InvoiceDetails} from './invoice/details/invoice';

import {TofHead} from './common/tofHead';
import {TofCustomerCard} from './common/customerCard';
import {TofDetailsForm} from './common/detailsForm';
import {TofDeliveryForm} from './common/deliveryForm';
import {TofHelper} from './salesHelper/tofHelper';
import {TradeItemTable} from './common/tradeitemTable';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // Unitable
        UniTableModule,

        // UniForm
        UniFormModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        ReportsModule,

        // Route module
        SalesRoutes
    ],
    declarations: [
        UniSales,
        Customer,
        CustomerDetailsModal,
        CustomerDetails,
        CustomerList,

        TofHead,
        TofCustomerCard,
        TofDetailsForm,
        TofDeliveryForm,
        TradeItemTable,

        InvoiceList,
        InvoiceDetails,

        OrderItemList,
        OrderDetails,
        OrderList,
        OrderToInvoiceTable,
        OrderToInvoiceModalType,
        OrderToInvoiceModal,
        QuoteDetails,
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
        TradeItemHelper,
        TofHelper
    ],
    exports: [
        UniSales,
        Customer,
        CustomerDetailsModal,
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
        QuoteList,
        SupplierDetailsModal,
        SupplierDetails,
        SupplierList
    ]
})
export class SalesModule {
}
