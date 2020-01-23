import {Routes} from '@angular/router';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {AltinnOverviewComponent} from './overview/altinn-overview.component';
import {AltinnSettings} from './settings/altinnSettings';
import {BarnepassView} from './overview/barnepass/barnepassview';
import { SelfEmployedView } from './overview/selfemployed/selfemployedview';

export const altinnRoutes: Routes = [
    {
        path: '',
        component: AltinnOverviewComponent
    },
    {
        path: 'overview',
        component: AltinnOverviewComponent
    },
    {
        path: 'settings',
        component: AltinnSettings
    },
    {
        path: 'childcare',
        component: BarnepassView
    },
    {
        path: 'selfemployed',
        component: SelfEmployedView
    },
];
