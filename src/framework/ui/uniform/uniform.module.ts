import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BySectionPipe, SectionIndexesPipe, UniForm, UniformErrorTemplatePipe } from './uniform';
import {UniSelect} from './controls/select/select';
import { IsRequiredPipe, UniField } from './unifield';
import {
    byFieldSetPipe, columnIndexesPipe, fieldsetIndexesPipe, getLegendPipe, noFieldSetPipe,
    UniSection
} from './unisection';
import {CONTROLS} from './controls/index';
import {ShowError} from './showError';
import {UniCalendar} from './controls/calendar';
import {UniLineBreak} from './unilinebreak';
import {LayoutBuilder} from './services/index';
import {ClickOutsideDirective} from './shared/clickOutside';

import {UniSearchModule} from '../unisearch/index';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UniSearchModule
    ],
    declarations: [
        UniForm,
        UniSelect,
        UniCalendar,
        UniField,
        UniSection,
        ShowError,
        UniLineBreak,
        CONTROLS,
        ClickOutsideDirective,
        SectionIndexesPipe,
        BySectionPipe,
        noFieldSetPipe,
        getLegendPipe,
        byFieldSetPipe,
        fieldsetIndexesPipe,
        columnIndexesPipe,
        UniformErrorTemplatePipe,
        IsRequiredPipe
    ],
    providers: [
        LayoutBuilder
    ],
    exports: [
        UniForm,
        UniSelect,
        UniCalendar,
        UniField,
        UniSection,
        ShowError,
        UniLineBreak,
        CONTROLS
    ]
})
export class UniFormModule {

}

