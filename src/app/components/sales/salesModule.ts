import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {salesRoutes} from './salesRoutes';
import {Customer} from './customer/customer';
import {CustomerDetails} from './customer/customerDetails/customerDetails';
import {CustomerProductsSold} from './customer/customerDetails/customerProductsSold';
import {CustomerList} from './customer/list/customerList';
import {ReportsModule} from '../reports/reportsModule';
import {UniTickerModule} from '../uniticker/uniTickerModule';
import {AppPipesModule} from '@app/pipes/appPipesModule';

import {InvoiceList} from './invoice/list/invoiceList';
import {OrderDetails} from './order/details/orderDetails';
import {TradeItemHelper} from './salesHelper/tradeItemHelper';
import {OrderList} from './order/list/orderList';
import {UniOrderToInvoiceModal} from './order/orderToInvoiceModal';
import {QuoteDetails} from './quote/details/quoteDetails';
import {QuoteList} from './quote/list/quoteList';

import {UniSales} from './sales';
import {InvoiceDetails} from './invoice/details/invoice';
import {UniRecurringInvoice} from './recurringInvoice/recurringInvoiceDetails';
import {RecurringInvoiceList} from './recurringInvoice/recurringInvoiceList';
import {UniRecurringInvoiceLogModal} from './recurringInvoice/recurringInvoiceLogModal';
import {InvoiceReminders} from './invoice/reminders/reminders';
import {Reminder} from './reminder/reminder';
import {ReminderList} from './reminder/list/reminderList';
import {ReminderConfirmModal, ReminderConfirmForm} from './reminder/list/reminderConfirmModal';
import {UniReminderSendingModal} from './reminder/sending/reminderSendingModal';
import {UniReminderSendingEditModal} from './reminder/sending/reminderSendingEditModal';
import {ReminderSending} from './reminder/sending/reminderSending';
import {DebtCollection} from './reminder/debtCollection/debtCollection';
import {SentToDebtCollection} from './reminder/sentToDebtCollection/sentToDebtCollection';
import {TofHead} from './common/tofHead';
import {TofCustomerCard} from './common/customerCard';
import {TofDetailsForm} from './common/detailsForm';
import {TofDeliveryForm} from './common/deliveryForm';
import {UniRecurringInvoiceSettingsView} from './common/recurringInvoiceSettings';
import {UniTofSelectModal} from './common/tofSelectModal';
import {TofHelper} from './salesHelper/tofHelper';
import {TradeItemTable} from './common/tradeItemTable';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {WidgetModule} from '../widgets/widgetModule';
import {ProductGroups} from './productgroup/productgroups';
import {GroupDetails} from './productgroup/groupDetails/groupDetails';
import {ProductDetails} from './products/productDetails';
import {ProductList} from './products/productList';
import {UniProductDetailsModal} from './products/productDetailsModal';
import {SellerList} from './sellers/sellerList';
import {SellerLinks} from './sellers/sellerlinks';
import {SellerDetails} from './sellers/sellerDetails';
import {SellerSalesList} from './sellers/sellerSalesList';
import {UniDimensionTOFView} from './common/dimensionForm';
import {UniDistibutionTOFView} from './common/distibutionForm';
import {SubCompanyComponent} from './customer/customerDetails/subcompany';
import {KIDSettings} from './kidSettings/kidSettings';
import {UniChooseOrderHoursModal} from './order/modal/chooseOrderHoursModal';
import { KidModalComponent } from '@app/components/sales/customer/kid-modal/kid-modal.component';
import {MatSlideToggleModule, MatTooltipModule, MatCardModule, MatTreeModule, MatProgressBarModule, MatSelectModule, MatOptionModule} from '@angular/material';
import { AvtaleGiroModal } from './customer/avtalegiro-modal/avtalegiro-modal';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatSlideToggleModule,
        MatTreeModule,
        MatTooltipModule,
        MatCardModule,
        MatProgressBarModule,
        MatSelectModule,
        MatOptionModule,

        RouterModule.forChild(salesRoutes),

        UniFrameworkModule,
        AppPipesModule,
        WidgetModule,
        LayoutModule,
        AppCommonModule,
        ReportsModule,
        UniTickerModule,
    ],
    declarations: [
        UniSales,
        Customer,
        CustomerDetails,
        CustomerProductsSold,
        CustomerList,
        SubCompanyComponent,

        TofHead,
        TofCustomerCard,
        TofDetailsForm,
        TofDeliveryForm,
        TradeItemTable,
        UniRecurringInvoiceSettingsView,
        UniTofSelectModal,
        UniDimensionTOFView,
        UniDistibutionTOFView,

        InvoiceList,
        InvoiceDetails,

        UniRecurringInvoice,
        RecurringInvoiceList,
        UniRecurringInvoiceLogModal,

        OrderDetails,
        OrderList,
        UniOrderToInvoiceModal,

        QuoteDetails,
        QuoteList,

        Reminder,
        ReminderList,
        ReminderConfirmModal,
        ReminderConfirmForm,
        ReminderSending,
        UniReminderSendingEditModal,
        UniReminderSendingModal,
        UniChooseOrderHoursModal,
        DebtCollection,
        SentToDebtCollection,
        InvoiceReminders,

        ProductGroups,
        GroupDetails,

        ProductDetails,
        ProductList,
        UniProductDetailsModal,

        SellerList,
        SellerLinks,
        SellerDetails,
        SellerSalesList,
        KIDSettings,
        KidModalComponent,
        AvtaleGiroModal
    ],
    entryComponents: [
        UniOrderToInvoiceModal,
        ReminderConfirmForm,
        UniReminderSendingModal,
        UniReminderSendingEditModal,
        ReminderSending,
        InvoiceReminders,
        UniTofSelectModal,
        UniProductDetailsModal,
        KidModalComponent,
        UniChooseOrderHoursModal,
        UniRecurringInvoiceLogModal,
        AvtaleGiroModal
    ],
    providers: [
        TradeItemHelper,
        TofHelper,
        CanDeactivateGuard,
    ],
    exports: [
        UniSales,
        Customer,
        CustomerDetails,
        CustomerProductsSold,
        CustomerList,
        InvoiceList,
        InvoiceDetails,
        OrderDetails,
        OrderList,
        UniOrderToInvoiceModal,
        QuoteDetails,
        QuoteList,
        Reminder,
        ReminderList,
        ReminderSending,
        UniReminderSendingModal,
        InvoiceReminders,
        ProductGroups,
        GroupDetails,
        KIDSettings,
        UniChooseOrderHoursModal,

        ProductDetails,
        ProductList,
        UniProductDetailsModal,

        SellerList,
        // SellerLinks,
        SellerDetails,
        SellerSalesList,
        KidModalComponent,
        AvtaleGiroModal
    ]
})
export class SalesModule {
}
