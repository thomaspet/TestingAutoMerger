import {ModuleWithProviders} from '@angular/core';
import {RouterModule} from '@angular/router';
import {Login} from './login/login';
import {ResetPassword} from './resetPassword/resetPassword';
import {ConfirmInvite} from './confirmInvite/confirmInvite';
import {Signup} from './signup/signup';

export const initRoutes = [
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
        path: 'reset-password',
        component: ResetPassword
    },
    {
        path: 'confirm/:guid',
        component: ConfirmInvite
    },
    {
        path: 'sign-up',
        component: Signup
    }
];
