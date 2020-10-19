import {Routes} from '@angular/router';

import {UniAccounting} from './accounting';
import {JournalEntry} from './journalentry/journalentry';
import {AccountSettings} from './accountSettings/accountSettings';
import {VatReportView} from './vatreport/vatreportview';
import {AccountingReports} from './accountingreports/accountingreports';
import {AccountDetailsReport} from './accountingreports/detailsmodal/accountDetailsReport';

import {BillsView} from './bill/bills';
import {BillView} from './bill/detail/bill';
import {SupplierDetails} from './supplier/details/supplierDetails';
import {SupplierList} from './supplier/list/supplierList';
import {PostPost} from './postpost/postpost';
import {TransqueryDetails} from './transquery/transqueryDetails';
import {UniBudgetView} from './budget/budgetview';
import {Expense} from './bill/expense/expense';
import {SupplierInvoiceView} from './supplier-invoice/supplier-invoice';
import {SupplierInvoiceExpense} from './supplier-invoice/supplier-invoice-expense';

import {routes as JournalEntryRoutes} from './journalentry/journalentryRoutes';
import {routes as AccountintReportsRoutes} from './accountingreports/accountingreportsRoutes';
import { CanDeactivateGuard } from '@app/canDeactivateGuard';
import {UniCostAllocation} from '@app/components/accounting/cost-allocation/cost-allocation';
import {SRSupplierInvoiceList} from './supplier-invoice/list/list';
import {UniInbox} from './inbox/inbox';
import {NewSupplierInvoiceList} from './supplier-invoice/supplier-invoice-list/supplier-invoice-list';
import {theme, THEMES} from 'src/themes/theme';

export const accountingRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: UniAccounting,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'journalentry',
        component: JournalEntry,
        children: JournalEntryRoutes,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'inbox',
        component: UniInbox,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'transquery',
        component: TransqueryDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'accountsettings',
        component: AccountSettings,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'vatreport',
        component: VatReportView,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'accountingreports',
        component: AccountingReports,
        children: AccountintReportsRoutes,
        canDeactivate: [CanDeactivateGuard]
    },
    theme.theme !== THEMES.EXT02 ? {
        path: 'bills',
        component: BillsView,
        canDeactivate: [CanDeactivateGuard]
    } :
    {
        path: 'bills',
        component: NewSupplierInvoiceList,
        canDeactivate: [CanDeactivateGuard]
    },
    theme.theme !== THEMES.EXT02 ? {
        path: 'bills/:id',
        component: BillView,
        canDeactivate: [CanDeactivateGuard]
    } :
    {
        path: 'bills/:id',
        component: SupplierInvoiceView,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'supplier-invoice',
        component: SRSupplierInvoiceList,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'supplier-invoice/:id',
        component: SupplierInvoiceView,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'supplier-invoice-expense',
        component: SupplierInvoiceExpense,
        // canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'suppliers',
        component: SupplierList,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'suppliers/:id',
        component: SupplierDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'accountquery',
        component: AccountDetailsReport,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'postpost',
        component: PostPost,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'budget',
        component: UniBudgetView,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'costallocation',
        component: UniCostAllocation,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'expense',
        component: Expense,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'assets',
        loadChildren: () => import('./assets/assets.module').then(m => {
            return m.AssetsModule;
        }),
        canDeactivate: [CanDeactivateGuard]
    }
];
