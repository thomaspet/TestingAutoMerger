import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UniDatepicker} from './datepicker';
import {MatDatepickerModule, DateAdapter} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {UniDateAdapter} from '@app/date-adapter';

@NgModule({
    imports: [
        CommonModule,
        MatDatepickerModule,
        FormsModule
    ],
    declarations: [UniDatepicker],
    providers: [{provide: DateAdapter, useClass: UniDateAdapter}],
    exports: [UniDatepicker]
})
export class DatepickerModule {}
