import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PeriodDateFormatPipe} from './periodDateFormatPipe';
import {UniAccountNumberPipe} from './uniAccountNumberPipe';
import {UniCurrencyPipe} from './uniCurrencyPipe';
import {UniDateFormatPipe} from './uniDateFormatPipe';
import {UniNumberFormatPipe} from './uniNumberFormatPipe';
import {SkipSanitizationPipe} from './skipSanitizationPipe';
import {UniTranslatePipe} from './uniTranslatePipe';
import {EntitytypeTranslationPipe} from './entitytype-translation.pipe';
import {UniStatusCodePipe} from './StatusCodePipe';
import {ElsaContractTypePipe} from './elsaContractTypePipe';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SkipSanitizationPipe,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniNumberFormatPipe,
        UniTranslatePipe,
        EntitytypeTranslationPipe,
        UniStatusCodePipe,
        ElsaContractTypePipe,
    ],
    providers: [
        SkipSanitizationPipe,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniNumberFormatPipe,
        UniTranslatePipe,
        EntitytypeTranslationPipe,
        ElsaContractTypePipe,
    ],
    exports: [
        SkipSanitizationPipe,
        CommonModule,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniNumberFormatPipe,
        UniTranslatePipe,
        EntitytypeTranslationPipe,
        UniStatusCodePipe,
        ElsaContractTypePipe,
    ]
})
export class AppPipesModule { }
