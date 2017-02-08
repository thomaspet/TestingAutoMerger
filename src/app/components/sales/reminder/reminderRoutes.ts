import {ReminderList} from './list/reminderList';
import {ReminderSending} from './sending/reminderSending';

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
    }
];
