import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PeriodDateFormatPipe} from './PeriodDateFormatPipe';
import {UniAccountNumberPipe} from './UniAccountNumberPipe';
import {UniCurrencyPipe} from './UniCurrencyPipe';
import {UniDateFormatPipe} from './UniDateFormatPipe';
import {SafeHtml} from './safeHTML';
import {UniNumberFormatPipe} from './UniNumberFormatPipe';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        SafeHtml,
        UniNumberFormatPipe
    ],
    providers: [
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        SafeHtml,
        UniNumberFormatPipe
    ],
    exports: [
        CommonModule,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        SafeHtml,
        UniNumberFormatPipe
    ]
})
export class AppPipesModule { }
