import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {salesRoutes} from './salesRoutes';
import {Customer} from './customer/customer';
import {CustomerDetailsModal} from './customer/customerDetails/customerDetailsModal';
import {CustomerDetails} from './customer/customerDetails/customerDetails';
import {CustomerProductsSold} from './customer/customerDetails/customerProductsSold';
import {CustomerList} from './customer/list/customerList';
import {ReportsModule} from '../reports/reportsModule';
import {UniTickerModule} from '../uniticker/uniTickerModule';

import {InvoiceList} from './invoice/list/invoiceList';
import {InvoiceList2} from './invoice/list/invoiceList2';
import {OrderDetails} from './order/details/orderDetails';
import {TradeItemHelper} from './salesHelper/tradeItemHelper';
import {OrderList} from './order/list/orderList';
import {OrderToInvoiceTable} from './order/modals/ordertoinvoice';
import {OrderToInvoiceModalType} from './order/modals/ordertoinvoice';
import {OrderToInvoiceModal} from './order/modals/ordertoinvoice';
import {QuoteDetails} from './quote/details/quoteDetails';
import {QuoteList} from './quote/list/quoteList';

import {UniSales} from './sales';
import {InvoiceDetails} from './invoice/details/invoice';
import {InvoiceReminders} from './invoice/reminders/reminders';
import {Reminder} from './reminder/reminder';
import {ReminderList} from './reminder/list/reminderList';
import {ReminderConfirmModal, ReminderConfirmForm} from './reminder/list/reminderConfirmModal';
import {UniReminderSendingModal} from './reminder/sending/reminderSendingModal';
import {ReminderSending} from './reminder/sending/reminderSending';
import {DebtCollection} from './reminder/debtCollection/debtCollection';
import {TofHead} from './common/tofHead';
import {TofCustomerCard} from './common/customerCard';
import {TofDetailsForm} from './common/detailsForm';
import {TofDeliveryForm} from './common/deliveryForm';
import {TofHelper} from './salesHelper/tofHelper';
import {TradeItemTable} from './common/tradeItemTable';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {WidgetModule} from '../widgets/widgetModule';
import {ProductGroups} from './productgroup/productgroups';
import {TreeModule} from 'angular-tree-component';
import {GroupDetails} from './productgroup/groupDetails/groupDetails';
import {ProductsInGroup} from './productgroup/productsInGroup/productsInGroup';
import {ProductDetails} from './products/productDetails';
import {ProductList} from './products/productList';
import {SellerList} from './sellers/sellerList';
import {SellerLinks} from './sellers/sellerLinks';
import {SellerDetails} from './sellers/sellerDetails';
import {SellerSalesList} from './sellers/sellerSalesList';
import {SellerDetailsComponent} from './sellers/sellerDetailsComponent';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,

        RouterModule.forChild(salesRoutes),

        UniFrameworkModule,

        WidgetModule,
        LayoutModule,
        AppCommonModule,
        ReportsModule,
        UniTickerModule,
        TreeModule,
    ],
    declarations: [
        UniSales,
        Customer,
        CustomerDetailsModal,
        CustomerDetails,
        CustomerProductsSold,
        CustomerList,

        TofHead,
        TofCustomerCard,
        TofDetailsForm,
        TofDeliveryForm,
        TradeItemTable,

        InvoiceList,
        InvoiceList2,
        InvoiceDetails,

        OrderDetails,
        OrderList,
        OrderToInvoiceTable,
        OrderToInvoiceModalType,
        OrderToInvoiceModal,

        QuoteDetails,
        QuoteList,

        Reminder,
        ReminderList,
        ReminderConfirmModal,
        ReminderConfirmForm,
        ReminderSending,
        UniReminderSendingModal,
        DebtCollection,
        InvoiceReminders,

        ProductGroups,
        ProductsInGroup,
        GroupDetails,

        ProductDetails,
        ProductList,

        SellerList,
        SellerLinks,
        SellerDetails,
        SellerSalesList,
        SellerDetailsComponent
    ],
    entryComponents: [
        OrderToInvoiceModalType,
        OrderToInvoiceTable,
        ReminderConfirmForm,
        UniReminderSendingModal,
        ReminderSending,
        InvoiceReminders
    ],
    providers: [
        TradeItemHelper,
        TofHelper,
        CanDeactivateGuard
    ],
    exports: [
        UniSales,
        Customer,
        CustomerDetailsModal,
        CustomerDetails,
        CustomerProductsSold,
        CustomerList,
        InvoiceList,
        InvoiceList2,
        InvoiceDetails,
        OrderDetails,
        OrderList,
        OrderToInvoiceTable,
        OrderToInvoiceModalType,
        OrderToInvoiceModal,
        QuoteDetails,
        QuoteList,
        Reminder,
        ReminderList,
        ReminderSending,
        UniReminderSendingModal,
        InvoiceReminders,
        ProductGroups,
        ProductsInGroup,
        GroupDetails,

        ProductDetails,
        ProductList,

        SellerList,
        SellerLinks,
        SellerDetails,
        SellerSalesList
    ]
})
export class SalesModule {
}
