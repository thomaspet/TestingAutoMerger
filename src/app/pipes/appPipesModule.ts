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
        UniStatusCodePipe
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
        UniStatusCodePipe
    ]
})
export class AppPipesModule { }
