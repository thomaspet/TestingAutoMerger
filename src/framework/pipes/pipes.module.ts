import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PeriodDateFormatPipe} from './periodDateFormatPipe';
import {UniAccountNumberPipe} from './uniAccountNumberPipe';
import {UniCurrencyPipe} from './uniCurrencyPipe';
import {UniNumberFormatPipe} from './uniNumberFormatPipe';
import {SkipSanitizationPipe} from './skipSanitizationPipe';
import {EntitytypeTranslationPipe} from './entitytype-translation.pipe';
import {ElsaContractTypePipe} from './elsaContractTypePipe';
import {ProductPurchaseStatusPipe} from './productPurchaseStatusPipe';
import {ProductTypePipe} from './productTypePipe';
import {UniAccountTypePipe} from './uniAccountTypePipe';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SkipSanitizationPipe,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniNumberFormatPipe,
        EntitytypeTranslationPipe,
        ElsaContractTypePipe,
        ProductPurchaseStatusPipe,
        ProductTypePipe,
        UniAccountTypePipe,
    ],
    providers: [
        SkipSanitizationPipe,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniNumberFormatPipe,
        EntitytypeTranslationPipe,
        ElsaContractTypePipe,
        ProductPurchaseStatusPipe,
        ProductTypePipe,
        UniAccountTypePipe,
    ],
    exports: [
        SkipSanitizationPipe,
        CommonModule,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniNumberFormatPipe,
        EntitytypeTranslationPipe,
        ElsaContractTypePipe,
        ProductPurchaseStatusPipe,
        ProductTypePipe,
        UniAccountTypePipe,
    ]
})
export class UniPipesModule { }
