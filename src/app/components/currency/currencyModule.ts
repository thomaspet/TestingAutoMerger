// Angular imports
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';

// specific imports
import {CurrencyComponent} from './currencyComponent';
import {CurrencyOverrides} from './currencyoverrides/currencyoverrides';
import {CurrencyExchange} from './currencyexchange/currencyexchange';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
    ],
    declarations: [
        CurrencyComponent,
        CurrencyOverrides,
        CurrencyExchange
    ],
    exports: [
        CurrencyOverrides,
        CurrencyExchange
    ]
})
export class CurrencyModule {}
