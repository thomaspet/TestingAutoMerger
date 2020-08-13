import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniDatepicker} from './datepicker';
import {DateAdapter} from '@angular/material/core';
import {UniDateAdapter} from '@app/date-adapter';
import { UniIconModule } from '../icon/uni-icon';


@NgModule({
    imports: [LibraryImportsModule, UniIconModule],
    declarations: [UniDatepicker],
    providers: [{provide: DateAdapter, useClass: UniDateAdapter}],
    exports: [UniDatepicker]
})
export class DatepickerModule {}
