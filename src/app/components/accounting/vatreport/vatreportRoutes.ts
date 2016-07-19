import {VatCheckListView} from './checkListView/checkListView';
import {VatReportView} from './reportView/reportView';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'report'
    },
    {
        path: 'checklist',
        component: VatCheckListView
    },
    {
        path: 'report',
        component: VatReportView
    }
];
