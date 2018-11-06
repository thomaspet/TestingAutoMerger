import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { UniSelect } from '@uni-framework/ui/uni-select/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    declarations: [UniSelect],
    exports: [UniSelect]
})
export class UniSelectModule {}
