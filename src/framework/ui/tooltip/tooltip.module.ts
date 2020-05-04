import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UniTooltip} from './tooltip';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
    imports: [CommonModule, MatTooltipModule],
    declarations: [UniTooltip],
    exports: [UniTooltip]
})
export class UniTooltipModule {}
