import {Routes} from '@angular/router';
import {UniQueries} from './uniQueries';
import {UniQueryOverview} from './overview/overview';
import {UniQueryDetails} from './details/uniQueryDetails';

export const uniQueryRoutes: Routes = [
    {
        path: 'uniqueries',
        component: UniQueries,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'overview'
            },
            {
                path: 'overview',
                component: UniQueryOverview
            },
            {
                path: 'details/:id',
                component: UniQueryDetails
            }
        ]
    }
];
