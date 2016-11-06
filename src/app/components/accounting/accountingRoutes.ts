import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {JournalEntry} from './journalentry/journalentry';
import {Transquery} from './transquery/transquery';
import {AccountSettings} from '../settings/accountSettings/accountSettings';
import {VatSettings} from '../settings/vatsettings/vatsettings';
import {VatReportView} from './vatreport/vatreportview';

import {BillsView} from './bill/bills';
import {BillView} from './bill/detail/bill';

import {routes as JournalEntryRoutes} from './journalentry/journalentryRoutes';
import {routes as TransqueryRoutes} from './transquery/transqueryRoutes';
import {UniAccounting} from './accounting';
import {AuthGuard} from '../../authGuard';


export const childRoutes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'journalentry'
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
        path: 'bills',
        component: BillsView
    },
    {
        path: 'bill/:id',
        component: BillView
    }
];


const accountingRoutes: Routes = [
    {
        path: 'accounting',
        component: UniAccounting,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(accountingRoutes);

