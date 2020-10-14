import {Routes} from '@angular/router';
import {AltinnOverviewComponent} from './overview/altinn-overview.component';
import {AltinnSettings} from './settings/altinnSettings';
import {BarnepassView} from './overview/barnepass/barnepassview';
import { SelfEmployedView } from './overview/selfemployed/selfemployedview';
import { SkattemeldingViewComponent } from './overview/skattemelding/skattemelding-view.component';

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
    {
        path: 'skattemelding',
        component: SkattemeldingViewComponent
    }
];
