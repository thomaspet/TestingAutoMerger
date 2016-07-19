import {Route} from '@angular/router';

import {Login} from './login/login';
import {Signup} from './signup/signup';
import {ResetPassword} from './resetPassword/resetPassword';
import {ConfirmInvite} from './confirmInvite/confirmInvite';

export const routes: Route[] = [
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
