import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';

import {CurrencyComponent} from './currencyComponent';
import {CurrencyOverrides} from './currencyoverrides/currencyoverrides';
import {CurrencyExchange} from './currencyexchange/currencyexchange';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,
        AppCommonModule,
    ],
    declarations: [
        CurrencyComponent,
        CurrencyOverrides,
        CurrencyExchange
    ]
})
export class CurrencyModule {}
