import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

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

import {InvoiceList} from './invoice/list/invoiceList';
import {OrderDetails} from './order/details/orderDetails';
import {TradeItemHelper} from './salesHelper/tradeItemHelper';
import {OrderList} from './order/list/orderList';
import {UniOrderToInvoiceModal} from './order/orderToInvoiceModal';
import {QuoteDetails} from './quote/details/quoteDetails';
import {QuoteList} from './quote/list/quoteList';

import {UniSales} from './sales';
import {InvoiceDetails} from './invoice/details/invoice';
import {SendInvoiceModal} from './invoice/modals/send-invoice-modal/send-invoice-modal';
import {UniRecurringInvoice} from './recurringInvoice/recurringInvoiceDetails';
import {RecurringInvoiceList} from './recurringInvoice/recurringInvoiceList';
import {UniRecurringInvoiceLogModal} from './recurringInvoice/recurringInvoiceLogModal';
import {InvoiceReminders} from './invoice/reminders/reminders';
import {Reminder} from './reminder/reminder';
import {ReminderList} from './reminder/list/reminderList';
import {ReminderConfirmModal, ReminderConfirmForm} from './reminder/list/reminderConfirmModal';
import {UniReminderSendingModal} from './reminder/sending/reminderSendingModal';
import {UniReminderSendingMethodModal} from './reminder/sending/reminderSendingMethodModal';
import {UniReminderSendingEditModal} from './reminder/sending/reminderSendingEditModal';
import {ReminderSending} from './reminder/sending/reminderSending';
import {DebtCollection} from './reminder/debtCollection/debtCollection';
import {SentToDebtCollection} from './reminder/sentToDebtCollection/sentToDebtCollection';
import {TofHead} from './common/tofHead';
import {TofCustomerCard} from './common/customerCard';
import {CustomerEditModal} from './common/customer-edit-modal/customer-edit-modal';
import {TofDetailsForm} from './common/detailsForm';
import {TofDeliveryForm} from './common/deliveryForm';
import {TofSellers} from './common/tof-sellers';
import {TofReportModal} from './common/tof-report-modal/tof-report-modal';
import {TofDistributionForm} from './common/tof-distribution-form';
import {UniRecurringInvoiceSettingsView} from './common/recurringInvoiceSettings';
import {UniTofSelectModal} from './common/tofSelectModal';
import {TofHelper} from './salesHelper/tofHelper';
import {TradeItemTable} from './common/tradeItemTable';
import {ProductGroups} from './productgroup/productgroups';
import {GroupDetails} from './productgroup/groupDetails/groupDetails';
import {ProductDetails} from './products/productDetails';
import {ProductList} from './products/productList';
import {UniProductDetailsModal} from './products/productDetailsModal';
import {SellerList} from './sellers/sellerList';
import {SellerLinks} from './sellers/sellerlinks';
import {SellerDetails} from './sellers/sellerDetails';
import {SellerSalesList} from './sellers/sellerSalesList';
import {SubCompanyComponent} from './customer/customerDetails/subcompany';
import {UniChooseOrderHoursModal} from './order/modal/chooseOrderHoursModal';
import {KidModalComponent} from '@app/components/sales/customer/kid-modal/kid-modal.component';
import {AvtaleGiroModal} from './customer/avtalegiro-modal/avtalegiro-modal';
import {AprilaOfferModal} from './invoice/modals/aprila-offer/aprila-offer-modal';
import {AprilaCreditNoteModal} from './invoice/modals/aprila-credit-note/aprila-credit-note-modal';

@NgModule({
    imports: [
        LibraryImportsModule,
        RouterModule.forChild(salesRoutes),

        UniFrameworkModule,
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
        CustomerEditModal,
        TofDetailsForm,
        TofDeliveryForm,
        TofDistributionForm,
        TofSellers,
        TradeItemTable,
        TofReportModal,
        UniRecurringInvoiceSettingsView,
        UniTofSelectModal,

        InvoiceList,
        InvoiceDetails,
        SendInvoiceModal,

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
        UniReminderSendingMethodModal,
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
        KidModalComponent,
        AvtaleGiroModal,
        AprilaOfferModal,
        AprilaCreditNoteModal
    ],
    providers: [
        TradeItemHelper,
        TofHelper,
    ]
})
export class SalesModule {
}
