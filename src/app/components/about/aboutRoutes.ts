import {Routes} from '@angular/router';
import {UniVersionsView} from './versions/versionsView';

export const aboutRoutes: Routes = [
    {
        path: 'about',
        children: [
            {
                path: 'versions',
                component: UniVersionsView
            }
        ],
    }
];
