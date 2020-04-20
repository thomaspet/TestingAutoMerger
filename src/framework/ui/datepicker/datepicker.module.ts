import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniDatepicker} from './datepicker';
import {DateAdapter} from '@angular/material/core';
import {UniDateAdapter} from '@app/date-adapter';

@NgModule({
    imports: [LibraryImportsModule],
    declarations: [UniDatepicker],
    providers: [{provide: DateAdapter, useClass: UniDateAdapter}],
    exports: [UniDatepicker]
})
export class DatepickerModule {}
