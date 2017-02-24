// Angular imports
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTableModule} from 'unitable-ng2/main';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {AppServicesModule} from '../../services/servicesModule';
import {UniFormModule} from 'uniform-ng2/main';

// routes
import {routes as CurrencyRoutes} from './currencyRoutes';

// specific imports
import {CurrencyComponent} from './currencyComponent';
import {CurrencyOverrides} from './currencyoverrides/currencyoverrides';
import {CurrencyExchange} from './currencyexchange/currencyexchange';

@NgModule({
    imports: [
        // Angular modules
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // UniForm
        UniFormModule,

        // UniTable
        UniTableModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        AppServicesModule,

        // Route module
        CurrencyRoutes

    ],
    declarations: [
        CurrencyComponent,
        CurrencyOverrides,
        CurrencyExchange
    ],
    entryComponents: [
    ],
    providers: [
    ],
    exports: [
        CurrencyOverrides,
        CurrencyExchange
    ]
})
export class CurrencyModule {
}
