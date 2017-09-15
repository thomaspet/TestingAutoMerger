import {Routes} from '@angular/router';

import {UniAccounting} from './accounting';
import {JournalEntry} from './journalentry/journalentry';
import {Transquery} from './transquery/transquery';
import {AccountSettings} from './accountSettings/accountSettings';
import {VatSettings} from './vatsettings/vatsettings';
import {VatReportView} from './vatreport/vatreportview';
import {AccountingReports} from './accountingreports/accountingreports';
import {AccountDetailsReport} from './accountingreports/detailsmodal/accountDetailsReport';

import {BillsView} from './bill/bills';
import {BillView} from './bill/detail/bill';

import {SupplierDetails} from './supplier/details/supplierDetails';
import {SupplierList} from './supplier/list/supplierList';

import {PostPost} from './postpost/postpost';

import {routes as JournalEntryRoutes} from './journalentry/journalentryRoutes';
import {routes as TransqueryRoutes} from './transquery/transqueryRoutes';
import {routes as AccountintReportsRoutes} from './accountingreports/accountingreportsRoutes';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

export const accountingRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: UniAccounting
    },
    {
        path: 'journalentry',
        component: JournalEntry,
        children: JournalEntryRoutes
    },
    {
        path: 'transquery',
        component: Transquery,
        children: TransqueryRoutes
    },
    {
        path: 'accountsettings',
        component: AccountSettings
    },
    {
        path: 'vatsettings',
        component: VatSettings
    },
    {
        path: 'vatreport',
        component: VatReportView
    },
    {
        path: 'accountingreports',
        component: AccountingReports,
        children: AccountintReportsRoutes
    },
    {
        path: 'bills',
        component: BillsView
    },
    {
        path: 'bills/:id',
        component: BillView,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'suppliers',
        component: SupplierList
    },
    {
        path: 'suppliers/:id',
        component: SupplierDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'accountquery',
        component: AccountDetailsReport
    },
    {
        path: 'postpost',
        component: PostPost,
        canDeactivate: [CanDeactivateGuard]
    }
];