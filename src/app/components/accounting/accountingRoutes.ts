import {JournalEntry} from './journalentry/journalentry';
import {Transquery} from './transquery/transquery';
import {AccountSettings} from '../settings/accountSettings/accountSettings';
import {VatSettings} from '../settings/vatsettings/vatsettings';
import {VatReport} from './vatreport/vatreport';

import {routes as JournalEntryRoutes} from './journalentry/journalentryRoutes';
import {routes as TransqueryRoutes} from './transquery/transqueryRoutes';
import {routes as VatReportRoutes} from './vatreport/vatreportRoutes';

export const routes = [
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
        component: VatReport,
        children: VatReportRoutes
    }
];
