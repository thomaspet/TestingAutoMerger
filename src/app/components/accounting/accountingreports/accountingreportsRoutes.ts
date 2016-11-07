import {ResultReport} from './resultreport/resultreport';
import {BalanceReport} from './balancereport/balancereport';
import {DimensionResultReport} from './dimensionreport/dimensionresultreport';

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
        path: 'dimension/:type/:id/:number/:name',
        component: DimensionResultReport
    }
];
