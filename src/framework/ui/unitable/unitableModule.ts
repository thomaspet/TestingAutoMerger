import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppPipesModule} from '../../../app/pipes/appPipesModule';

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
import {UniTableColumnConfigEditor} from './columnMenu/columnConfigEditor';
import {UnitableTextInput} from './controls/text';
import {UnitableAutocomplete} from './controls/table-autocomplete';
import {UnitableTypeahead} from './controls/typeahead';
import {UnitableNumberInput} from './controls/number';
import {UnitableDateTimepicker} from './controls/dateTimePicker/dateTimePicker';
import {UnitableSelect} from './controls/select';
import {LocalDatePicker} from './controls/localDatePicker/LocalDatePicker';

import {ColumnMenuModal} from './columnMenu/columnMenuModal';
import {ColumnTooltipPipe} from './columnTooltipPipe';
import {UniTableHeader} from './header/unitable-header';

import {MatMenuModule, MatDatepickerModule, DateAdapter} from '@angular/material';
import {InputDropdownModule} from '../input-dropdown/input-dropdown';
import {UniDateAdapter} from '@app/date-adapter';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatDatepickerModule,
        AppPipesModule,
        InputDropdownModule
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

        UniTablePipe,
        ColumnTooltipPipe,
        ColumnMenuModal,

        UniTableHeader
    ],
    entryComponents: [
        UnitableTextInput,
        UnitableAutocomplete,
        UnitableTypeahead,
        UnitableNumberInput,
        UnitableDateTimepicker,
        UnitableSelect,
        LocalDatePicker,
        ColumnMenuModal
    ],
    providers: [
        UniTableUtils,
        {provide: DateAdapter, useClass: UniDateAdapter},
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

        UniTablePipe,
        ColumnTooltipPipe,
    ]
})
export class UniTableModule {}
