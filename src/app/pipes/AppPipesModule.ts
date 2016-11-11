import {NgModule} from '@angular/core';
import {PeriodDateFormatPipe} from './PeriodDateFormatPipe';
import {UniAccountNumberPipe} from './UniAccountNumberPipe';
import {UniCurrencyPipe} from './UniCurrencyPipe';
import {UniDateFormatPipe} from './UniDateFormatPipe';
import {SafeHtml} from './safeHTML';
import {UniNumberFormatPipe} from './UniNumberFormatPipe';

@NgModule({
    declarations: [
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        SafeHtml,
        UniNumberFormatPipe
    ],
    exports: [
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        SafeHtml,
        UniNumberFormatPipe
    ]
})
export class AppPipesModule {

}
