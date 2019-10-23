import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputDropdownModule} from '../input-dropdown/input-dropdown';
import {MatProgressSpinnerModule, MatCheckboxModule} from '@angular/material';
import {Autocomplete} from './autocomplete';
import {ClickOutsideModule} from '@uni-framework/click-outside/click-outside.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InputDropdownModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        ClickOutsideModule,
    ],
    declarations: [Autocomplete],
    exports: [Autocomplete]
})
export class AutocompleteModule {}
