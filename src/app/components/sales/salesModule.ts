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
import { QuoteList } from './quote/list/quoteList';
import { Project } from './project/project';
import { ProjectOverview } from './project/overview/overview';
import { ProjectTasks } from './project/tasks/tasks';
import { ProjectEditmode } from './project/editmode/editmode';
import {UniTableModule} from '../../../framework/ui/unitable/index';
import {UniFormModule} from '../../../framework/ui/uniform/index';
import {UniSales} from './sales';
import {InvoiceDetails} from './invoice/details/invoice';
import {InvoiceReminders} from './invoice/reminders/reminders';
import {Reminder} from './reminder/reminder';
import {ReminderList} from './reminder/list/reminderList';
import {ReminderConfirmModal, ReminderConfirmForm} from './reminder/list/reminderConfirmModal';
import {ReminderSendingModal, ReminderSendingModalContent} from './reminder/sending/reminderSendingModal';
import {ReminderSending} from './reminder/sending/reminderSending';
import {DebtCollection} from './reminder/debtCollection/debtCollection';
import {TofHead} from './common/tofHead';
import {TofCustomerCard} from './common/customerCard';
import {TofDetailsForm} from './common/detailsForm';
import {TofDeliveryForm} from './common/deliveryForm';
import {TofHelper} from './salesHelper/tofHelper';
import {TradeItemTable} from './common/tradeItemTable';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {UniSearchModule} from '../../../framework/ui/unisearch/index';
import {WidgetModule} from '../widgets/widgetModule';
import {ProductGroups} from './productgroup/groups/productgroups';
import {TreeModule} from 'angular-tree-component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,

        RouterModule.forChild(salesRoutes),

        // Unitable
        UniTableModule,

        // UniForm
        UniFormModule,

        // Framework
        UniFrameworkModule,
        // App Modules
        WidgetModule,
        LayoutModule,
        AppCommonModule,
        ReportsModule,
        UniTickerModule,
        TreeModule,

        // Route module
        UniSearchModule
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
        InvoiceList2,
        InvoiceDetails,

        OrderDetails,
        OrderList,
        OrderToInvoiceTable,
        OrderToInvoiceModalType,
        OrderToInvoiceModal,

        QuoteDetails,
        QuoteList,

        Project,
        ProjectOverview,
        ProjectTasks,
        ProjectEditmode,

        Reminder,
        ReminderList,
        ReminderConfirmModal,
        ReminderConfirmForm,
        ReminderSending,
        ReminderSendingModalContent,
        ReminderSendingModal,
        DebtCollection,
        InvoiceReminders,

        ProductGroups
    ],
    entryComponents: [
        OrderToInvoiceModalType,
        OrderToInvoiceTable,
        ReminderConfirmForm,
        ReminderSendingModalContent,
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
        Project,
        ProjectOverview,
        ProjectTasks,
        ProjectEditmode,
        Reminder,
        ReminderList,
        ReminderSending,
        ReminderSendingModal,
        InvoiceReminders,
        ProductGroups
    ]
})
export class SalesModule {
}
