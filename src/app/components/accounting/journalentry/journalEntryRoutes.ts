import {JournalEntries} from './journalentries/journalentries';
import {Payments} from './payments/payments';
import {BillsView} from './../bill/bills';
import {CanDeactivateGuard} from '../../../canDeactivateGuard';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'manual'
    },
    {
        path: 'manual',
        component: JournalEntries
    },
    {
        path: 'payments',
        component: Payments
    },
    {
        path: 'bills',
        component: BillsView
    },
];
