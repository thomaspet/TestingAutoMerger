import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {AppServicesModule} from '../../services/servicesModule';
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
import {routes as ExampleRoutes} from './examplesRoutes';
import {Examples} from './examples';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // UniTable
        UniTableModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        AppServicesModule,
        ExampleRoutes
    ],
    declarations: [
        Examples,
        XFormDemo,
        UniTableDemoNew,
        ImageDemo,
        UniModalDemo,
        UniModalAdvancedDemo,
        UniDocumentDemo,
        UniSaveDemo,
        UniToastDemo,
        UniSelectDemo,
        UniDynamicDemo
    ],
    providers: [],
    exports: [
        Examples,
        XFormDemo,
        UniTableDemoNew,
        ImageDemo,
        UniModalDemo,
        UniModalAdvancedDemo,
        UniDocumentDemo,
        UniSaveDemo,
        UniToastDemo,
        UniSelectDemo,
        UniDynamicDemo
    ]
})
export class ExamplesModule {

}
