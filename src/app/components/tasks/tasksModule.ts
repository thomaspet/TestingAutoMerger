// Angular imports
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTableModule} from '../../../framework/ui/unitable/index';
import {UniFormModule} from '../../../framework/ui/uniform/index';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {UniQueryModule} from '../uniquery/uniqueryModule';

import {SupplierInvoicePreview} from './previews/supplierInvoicePreview';

// routes
import {routes as AdminRoutes} from './tasksRoutes';

// app
import {UniTasks} from './tasks';
import {TaskList} from './list/taskList';
import {TaskDetails} from './details/taskDetails';

@NgModule({
    imports: [
        // Angular modules
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // UniTable
        UniTableModule,

        // UniFormModule,
        UniFormModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        UniQueryModule,
        AdminRoutes
    ],
    declarations: [
        UniTasks,
        TaskList,
        TaskDetails,
        SupplierInvoicePreview
    ],
    exports: [
        UniTasks,
        TaskList,
        TaskDetails
    ]
})
export class TasksModule {
}