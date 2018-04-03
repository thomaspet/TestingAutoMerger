import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PeriodDateFormatPipe} from './periodDateFormatPipe';
import {UniAccountNumberPipe} from './uniAccountNumberPipe';
import {UniCurrencyPipe} from './uniCurrencyPipe';
import {UniDateFormatPipe} from './uniDateFormatPipe';
import {UniNumberFormatPipe} from './uniNumberFormatPipe';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniNumberFormatPipe
    ],
    providers: [
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniNumberFormatPipe
    ],
    exports: [
        CommonModule,
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        UniNumberFormatPipe
    ]
})
export class AppPipesModule { }
