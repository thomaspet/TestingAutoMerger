import {Login} from './login/login';
import {ConfirmInvite} from './confirmInvite/confirmInvite';
import {Signup} from './signup/signup';
import {RegisterCompany} from './registerCompany/registerCompany';

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
        path: 'confirm/:guid',
        component: ConfirmInvite
    },
    {
        path: 'sign-up',
        component: Signup
    },
    {
        path: 'register-company',
        component: RegisterCompany,
    },
];
