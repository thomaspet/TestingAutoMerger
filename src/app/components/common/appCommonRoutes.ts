import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {UniDimensions} from './dimensions/UniDimensions';
import {routes as DimensionRoutes} from './dimensions/dimensionsRoutes';
import {ContactDetails} from './contact/contactDetails';
import {PredefinedDescriptionList} from './predefinedDescriptions/predefinedDescriptionList';

const commonRoutes: Routes = [
    {
        path: 'dimensions',
        component: UniDimensions,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: DimensionRoutes
        }],
    },
    {
        path: 'contacts/:id',
        component: ContactDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'predefined-descriptions',
        component: PredefinedDescriptionList,
        canDeactivate: [CanDeactivateGuard]
    },
];

export const routes: ModuleWithProviders = RouterModule.forChild(commonRoutes);
