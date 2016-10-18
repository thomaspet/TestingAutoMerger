import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CompanySettingsComponent} from './companySettings/companySettings';
import {AgaAndSubEntitySettings} from './agaAndSubEntitySettings/agaAndSubEntitySettings';
import {UserSettings} from './userSettings/userSettings';
import {Users} from './users/users';
import {AltinnSettings} from './altinnSettings/altinnSettings';
import {Settings} from "./settings";
import {AuthGuard} from "../../authGuard";

export const childRoutes: Routes = [
    {
        path: '',
        redirectTo: 'company',
        pathMatch: 'full'
    },
    {
        path: 'company',
        component: CompanySettingsComponent
    },
    {
        path: 'aga-and-subentities',
        component: AgaAndSubEntitySettings
    },
    {
        path: 'user',
        component: UserSettings
    },
    {
        path: 'users',
        component: Users
    },
    {
        path: 'altinn',
        component: AltinnSettings
    }
];

const settingsRoutes: Routes = [
    {
        path: 'settings',
        component: Settings,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(settingsRoutes);
