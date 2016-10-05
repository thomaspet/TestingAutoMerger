import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {XFormDemo} from './form/xFormDemo';
import {UniTableDemoNew} from './table/tableDemoNew';
import {ImageDemo} from './image/imageDemo';
import {UniModalDemo} from './modal/modalDemo';
import {UniModalAdvancedDemo} from './modal/advancedDemo';
import {UniDocumentDemo} from './documents/document';
import {UniSaveDemo} from './save/saveDemo';
import {UniToastDemo} from './toast/toastDemo';
import {UniSelectDemo} from './select/selectDemo';
import {UniDynamicDemo} from './dynamic/index';
import {Examples} from './examples';
import {AuthGuard} from '../../authGuard';

export const childRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'xform'
    },
    {
        path: 'xform',
        component: XFormDemo
    },
    {
        path: 'tablenew',
        component: UniTableDemoNew,
    },
    {
        path: 'image',
        component: ImageDemo
    },
    {
        path: 'modal',
        component: UniModalDemo
    },
    {
        path: 'modal-advanced',
        component: UniModalAdvancedDemo
    },
    {
        path: 'documents',
        component: UniDocumentDemo
    },
    {
        path: 'save',
        component: UniSaveDemo
    },
    {
        path: 'toast',
        component: UniToastDemo
    },
    {
        path: 'select',
        component: UniSelectDemo
    },
    {
        path: 'dynamic',
        component: UniDynamicDemo
    }
];

const exampleRoutes: Routes = [
    {
        path: 'examples',
        component: Examples,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(exampleRoutes);
