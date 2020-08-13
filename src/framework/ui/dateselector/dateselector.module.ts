import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UniDateSelector} from './dateselector';
import {MatMenuModule} from '@angular/material/menu';
import { UniIconModule } from '../icon/uni-icon';

@NgModule({
    imports: [CommonModule, MatMenuModule, UniIconModule],
    declarations: [UniDateSelector],
    exports: [UniDateSelector]
})
export class UniDateselectorpModule {}
