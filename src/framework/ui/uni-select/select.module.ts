import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClickOutsideModule} from '../../click-outside/click-outside.module';
import { UniSelect } from '@uni-framework/ui/uni-select/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {InputDropdownModule} from '../input-dropdown/input-dropdown';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ClickOutsideModule, InputDropdownModule],
    declarations: [UniSelect],
    exports: [UniSelect]
})
export class UniSelectModule {}
