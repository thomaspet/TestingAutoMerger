import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';
import {ClickOutsideModule} from '../../click-outside/click-outside.module';

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
import { MarkLastFieldPipe } from '@uni-framework/ui/uniform/pipes/mark-last-field.pipe';

import {UniField} from './unifield/unifield';
import {UniSection} from './unisection/unisection';
import {CONTROLS} from './controls/index';
import {ShowError} from './showError.component';
import {UniLineBreak} from './uni-linebreak.component';
import {LayoutBuilder} from './services/index';

import {UniSearchModule} from '../unisearch/index';
import {UniTooltipModule} from '../tooltip/tooltip.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {UniSelectModule} from '@uni-framework/ui/uni-select/select.module';
import {InputDropdownModule} from '../input-dropdown/input-dropdown';
import {UniDateAdapter} from '@app/date-adapter';
import {DateAdapter} from '@angular/material/core';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniSearchModule,
        UniTooltipModule,
        NgSelectModule,
        UniSelectModule,
        InputDropdownModule,
        ClickOutsideModule
    ],
    declarations: [
        UniForm,
        UniField,
        UniSection,
        ShowError,
        UniLineBreak,
        CONTROLS,
        SectionIndexesPipe,
        BySectionPipe,
        NoFieldSetPipe,
        GetLegendPipe,
        ByFieldsetPipe,
        FieldsetIndexesPipe,
        ColumnIndexesPipe,
        UniformErrorTemplatePipe,
        IsRequiredPipe,
        MarkLastFieldPipe
    ],
    providers: [
        LayoutBuilder,
        {provide: DateAdapter, useClass: UniDateAdapter},
    ],
    exports: [
        UniForm,
        UniSelectModule,
        UniField,
        UniSection,
        ShowError,
        UniLineBreak,
        CONTROLS
    ]
})
export class UniFormModule {

}

