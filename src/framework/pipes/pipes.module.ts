import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PeriodDateFormatPipe} from './periodDateFormatPipe';
import {UniAccountNumberPipe} from './uniAccountNumberPipe';
import {UniCurrencyPipe} from './uniCurrencyPipe';
import {UniNumberFormatPipe} from './uniNumberFormatPipe';
import {SkipSanitizationPipe} from './skipSanitizationPipe';
import {UniTranslatePipe} from './uniTranslatePipe';
import {EntitytypeTranslationPipe} from './entitytype-translation.pipe';
import {ElsaContractTypePipe} from './elsaContractTypePipe';
import {ProductPurchaseStatusPipe} from './productPurchaseStatusPipe';
import {ProductTypePipe} from './productTypePipe';

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
        UniTranslatePipe,
        EntitytypeTranslationPipe,
        ElsaContractTypePipe,
        ProductPurchaseStatusPipe,
        ProductTypePipe,
    ],
    providers: [
        SkipSanitizationPipe,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniNumberFormatPipe,
        UniTranslatePipe,
        EntitytypeTranslationPipe,
        ElsaContractTypePipe,
        ProductPurchaseStatusPipe,
        ProductTypePipe,
    ],
    exports: [
        SkipSanitizationPipe,
        CommonModule,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniNumberFormatPipe,
        UniTranslatePipe,
        EntitytypeTranslationPipe,
        ElsaContractTypePipe,
        ProductPurchaseStatusPipe,
        ProductTypePipe,
    ]
})
export class UniPipesModule { }
