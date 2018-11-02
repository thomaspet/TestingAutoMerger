import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PeriodDateFormatPipe} from './periodDateFormatPipe';
import {UniAccountNumberPipe} from './uniAccountNumberPipe';
import {UniCurrencyPipe} from './uniCurrencyPipe';
import {UniDateFormatPipe} from './uniDateFormatPipe';
import {UniNumberFormatPipe} from './uniNumberFormatPipe';
import {SkipSanitizationPipe} from './skipSanitizationPipe';

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
        UniNumberFormatPipe
    ],
    providers: [
        SkipSanitizationPipe,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniNumberFormatPipe
    ],
    exports: [
        SkipSanitizationPipe,
        CommonModule,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniNumberFormatPipe
    ]
})
export class AppPipesModule { }
