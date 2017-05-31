import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {UniVersionsView} from './versions/versionsView';
import {UniAbout} from './about';

// module

export const childRoutes = [
    {
        path: 'versions',
        component: UniVersionsView
    }
];

const aboutRoutes: Routes = [
    {
        path: 'about',
        component: UniAbout,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(aboutRoutes);
