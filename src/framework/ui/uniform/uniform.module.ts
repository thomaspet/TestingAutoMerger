import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniForm} from './uniform/uniform';

import {SectionIndexesPipe} from '@uni-framework/ui/uniform/pipes/section-indexes.pipe';
import {BySectionPipe} from '@uni-framework/ui/uniform/pipes/by-section.pipe';
import {UniformErrorTemplatePipe} from '@uni-framework/ui/uniform/pipes/uniform-error-template.pipe';
import {NoFieldSetPipe} from '@uni-framework/ui/uniform/pipes/no-fieldset.pipe';
import {FieldsetIndexesPipe} from '@uni-framework/ui/uniform/pipes/fieldset-indexes.pipe';
import {ColumnIndexesPipe} from '@uni-framework/ui/uniform/pipes/column-indexes.pipe';
import {GetLegendPipe} from '@uni-framework/ui/uniform/pipes/get-legend.pipe';
import {ByFieldsetPipe} from '@uni-framework/ui/uniform/pipes/by-fieldset.pipe';
import {IsRequiredPipe} from '@uni-framework/ui/uniform/pipes/is-required.pipe';

import {UniSelect} from './controls/select/select';
import {UniField} from './unifield/unifield';
import {UniSection} from './unisection/unisection';
import {CONTROLS} from './controls/index';
import {ShowError} from './showError.component';
import {UniCalendar} from './controls/calendar/calendar';
import {UniLineBreak} from './uni-linebreak.component';
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
        NoFieldSetPipe,
        GetLegendPipe,
        ByFieldsetPipe,
        FieldsetIndexesPipe,
        ColumnIndexesPipe,
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

