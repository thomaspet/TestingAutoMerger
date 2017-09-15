import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UniVersionsView} from './versions/versionsView';
import {UniAbout} from './about';

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
        children: childRoutes,
    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(aboutRoutes);
