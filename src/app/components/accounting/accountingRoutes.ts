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
        path: 'bill/:id',
        component: BillView,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'accountquery',
        component: AccountDetailsReport
    }
];


// const accountingRoutes: Routes = [
//     {
//         path: 'accounting',
//         component: UniAccounting,
//         canActivate: [AuthGuard],
//         children: [{
//             path: '',
//             canActivateChild: [AuthGuard],
//             children: childRoutes
//         }],

//     }
// ];

// export const routes: ModuleWithProviders = RouterModule.forChild(accountingRoutes);

