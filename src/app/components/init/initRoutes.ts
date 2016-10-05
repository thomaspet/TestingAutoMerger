import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UniInit} from './init';
import {Login} from './login/login';
import {Signup} from './signup/signup';
import {ResetPassword} from './resetPassword/resetPassword';
import {ConfirmInvite} from './confirmInvite/confirmInvite';


export const childRoutes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'signup',
        component: Signup
    },
    {
        path: 'reset-password',
        component: ResetPassword
    },
    {
        path: 'confirm/:guid',
        component: ConfirmInvite
    },
];

const initRoutes: Routes = [
    {
        path: 'init',
        component: UniInit,
        children: [{
            path: '',
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(initRoutes);
