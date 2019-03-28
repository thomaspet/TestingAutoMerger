import {ResultReport} from './resultreport/resultreport';
import {BalanceReport} from './balancereport/balancereport';
import {DimensionResultReport} from './dimensionreport/dimensionresultreport';
import {DimensionTypeReport} from './dimensionreport/dimensiontypereport';
import { AccountingReportShortcuts } from '@app/components/accounting/accountingreports/reportshortcuts';

export const routes = [
    {
        path: '',
        redirectTo: 'result',
        pathMatch: 'full',
    },
    {
        path: 'result',
        component: ResultReport
    },
    {
        path: 'balance',
        component: BalanceReport
    },
    {
        path: 'dimensions',
        component: DimensionTypeReport
    },
    {
        path: 'dimension',
        component: DimensionResultReport
    },
    {
        path: 'reports',
        component: AccountingReportShortcuts
    }
];
