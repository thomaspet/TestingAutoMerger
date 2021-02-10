import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniSearch} from './UniSearch';
import {UniSearchAttr} from './UniSearchAttr';
import {ClickOutsideModule} from '../../click-outside/click-outside.module';
import {InputDropdownModule} from '../input-dropdown/input-dropdown';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ClickOutsideModule,
        InputDropdownModule
    ],
    declarations: [
        UniSearch,
        UniSearchAttr
    ],
    exports: [
        UniSearch,
        UniSearchAttr
    ]
})
export class UniSearchModule {}
