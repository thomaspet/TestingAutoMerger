import { ReminderList } from './list/reminderList';
import { ReminderSending } from './sending/reminderSending';
import { DebtCollection } from './debtCollection/debtCollection';
import { SentToDebtCollection } from './sentToDebtCollection/sentToDebtCollection';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'ready'
    },
    {
        path: 'ready',
        component: ReminderList
    },
    {
        path: 'reminded',
        component: ReminderSending
    },
    {
        path: 'debtcollect',
        component: DebtCollection
    },
    {
        path: 'senttodebtcollect',
        component: SentToDebtCollection
    }
];
