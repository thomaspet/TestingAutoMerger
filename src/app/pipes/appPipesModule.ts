import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PeriodDateFormatPipe} from './periodDateFormatPipe';
import {UniAccountNumberPipe} from './uniAccountNumberPipe';
import {UniCurrencyPipe} from './uniCurrencyPipe';
import {UniDateFormatPipe} from './uniDateFormatPipe';
import {UniNumberFormatPipe} from './uniNumberFormatPipe';
import {SkipSanitizationPipe} from './skipSanitizationPipe';
import { EntitytypeTranslationPipe } from './entitytype-translation.pipe';

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
        EntitytypeTranslationPipe,
    ],
    providers: [
        SkipSanitizationPipe,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniNumberFormatPipe,
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
        EntitytypeTranslationPipe,
    ]
})
export class AppPipesModule { }
