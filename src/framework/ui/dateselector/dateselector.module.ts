import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UniDateSelector} from './dateselector';

import {MatMenuModule} from '@angular/material';

@NgModule({
    imports: [CommonModule, MatMenuModule],
    declarations: [UniDateSelector],
    exports: [UniDateSelector]
})
export class UniDateselectorpModule {}
