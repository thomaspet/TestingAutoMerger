import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Sharings} from './sharings';
import {SharingsList} from './list/sharingsList';

const childRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: SharingsList
    }
];

const sharingsRoutes: Routes = [
    {
        path: 'sharings',
        component: Sharings,
        children: childRoutes
    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(sharingsRoutes);
