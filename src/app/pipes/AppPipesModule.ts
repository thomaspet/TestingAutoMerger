import {NgModule} from '@angular/core';
import {PeriodDateFormatPipe} from './PeriodDateFormatPipe';
import {UniAccountNumberPipe} from './UniAccountNumberPipe';
import {UniCurrencyPipe} from './UniCurrencyPipe';
import {UniDateFormatPipe} from './UniDateFormatPipe';
import {SafeHtml} from './safeHTML';

@NgModule({
    declarations: [
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        SafeHtml
    ],
    exports: [
        PeriodDateFormatPipe,
        UniAccountNumberPipe,
        UniCurrencyPipe,
        UniDateFormatPipe,
        SafeHtml
    ]
})
export class AppPipesModule {

}
