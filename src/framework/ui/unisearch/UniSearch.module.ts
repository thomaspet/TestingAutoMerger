import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniSearch} from './UniSearch';
import {UniSearchAttr} from './UniSearchAttr';
import {TestDataService} from './TestDataService';
import {ClickOutsideModule} from '../../click-outside/click-outside.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ClickOutsideModule
    ],
    declarations: [
        UniSearch,
        UniSearchAttr
    ],
    providers: [
        TestDataService
    ],
    exports: [
        UniSearch,
        UniSearchAttr
    ]
})
export class UniSearchModule {}
