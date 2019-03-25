import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClickOutsideModule} from '../../click-outside/click-outside.module';
import { UniSelect } from '@uni-framework/ui/uni-select/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ClickOutsideModule],
    declarations: [UniSelect],
    exports: [UniSelect]
})
export class UniSelectModule {}
