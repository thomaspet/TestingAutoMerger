import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PeriodDateFormatPipe} from './PeriodDateFormatPipe';
import {UniAccountNumberPipe} from './UniAccountNumberPipe';
import {UniCurrencyPipe} from './UniCurrencyPipe';
import {UniDateFormatPipe} from './UniDateFormatPipe';
import {UniSafeHtml} from './safeHTML';
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
        UniSafeHtml,
        UniNumberFormatPipe
    ],
    providers: [
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniSafeHtml,
        UniNumberFormatPipe
    ],
    exports: [
        CommonModule,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniSafeHtml,
        UniNumberFormatPipe
    ]
})
export class AppPipesModule { }
