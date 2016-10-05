import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {UniDimensions} from './dimensions/UniDimensions';
import {routes as DimensionRoutes} from './dimensions/dimensionsRoutes';


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

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(commonRoutes);
