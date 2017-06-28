import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { COMPILER_PROVIDERS } from '@angular/compiler';
import {UniTable} from './unitable';
import {UniTableUtils} from './unitableUtils';
import {UniTableRow} from './unitableRow';
import {UnitableEditor} from './editor/editor';
import {UniTableColumnMenu} from './columnMenu/columnMenu';
import {UniTablePagination} from './pagination/pagination';
import {UnitableContextMenu} from './contextMenu';
import {UniTableSearch} from './search/search';
import {UniTablePipe} from './unitablePipe';
import {UniCalendar} from './controls/common/calendar';
import {DateUtil} from './controls/common/DateUtil';
import {UniTableColumnConfigEditor} from './columnMenu/columnConfigEditor';
import {UnitableTextInput} from './controls/text';
import {UnitableAutocomplete} from './controls/autocomplete';
import {UnitableTypeahead} from './controls/typeahead';
import {UnitableNumberInput} from './controls/number';
import {UnitableDateTimepicker} from './controls/dateTimePicker/dateTimePicker';
import {UnitableSelect} from './controls/select';
import {LocalDatePicker} from './controls/localDatePicker/LocalDatePicker';
import {UniSearchWrapper} from './controls/uniSearchWrapper';
import {UniSearchModule} from '../unisearch/index';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UniSearchModule
    ],
    declarations: [
        UniTable,
        UniTableRow,
        UnitableEditor,
        UniTableColumnMenu,
        UniTablePagination,
        UnitableContextMenu,
        UniTableSearch,
        UniCalendar,
        UniTableColumnConfigEditor,
        UnitableTextInput,
        UnitableAutocomplete,
        UnitableTypeahead,
        UnitableNumberInput,
        UnitableDateTimepicker,
        UnitableSelect,
        LocalDatePicker,

        // UniTableUtils,
        // DateUtil,
        UniTablePipe,
        UniSearchWrapper,
    ],
    entryComponents: [
        UnitableTextInput,
        UnitableAutocomplete,
        UnitableTypeahead,
        UnitableNumberInput,
        UnitableDateTimepicker,
        UnitableSelect,
        LocalDatePicker,
        UniSearchWrapper,
    ],
    providers: [
        COMPILER_PROVIDERS,
        UniTableUtils,
        DateUtil,
        UniTablePipe
    ],
    exports: [
        UniTable,
        UniTableRow,
        UnitableEditor,
        UniTableColumnMenu,
        UniTablePagination,
        UnitableContextMenu,
        UniTableSearch,
        UniCalendar,
        UniTableColumnConfigEditor,
        UnitableTextInput,
        UnitableAutocomplete,
        UnitableTypeahead,
        UnitableNumberInput,
        UnitableDateTimepicker,
        UnitableSelect,
        LocalDatePicker,

        // UniTableUtils,
        // DateUtil,
        UniTablePipe,
        UniSearchWrapper,
    ]
})
export class UniTableModule {
    constructor() {
        UnitableEditor.parentModule = UniTableModule;
    }
}
