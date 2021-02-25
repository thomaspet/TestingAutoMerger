import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniPipesModule} from '../../pipes/pipes.module';
import {UniTranslatePipesModule} from '../../pipes/translate.module';

import {UniTable} from './unitable';
import {UniTableUtils} from './unitableUtils';
import {UniTableRow} from './unitableRow';
import {UnitableEditor} from './editor/editor';
import {UniTableColumnMenu} from './columnMenu/columnMenu';
import {UniTablePagination} from './pagination/pagination';
import {UnitableContextMenu} from './contextMenu';
import {UniTableSearch} from './search/search';
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

import {DateAdapter} from '@angular/material/core';
import {InputDropdownModule} from '../input-dropdown/input-dropdown';
import {UniDateAdapter} from '@app/date-adapter';
import { UniIconModule } from '../icon/uni-icon';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniPipesModule,
        UniTranslatePipesModule,
        InputDropdownModule,
        UniIconModule,
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

        ColumnTooltipPipe,
        ColumnMenuModal,

        UniTableHeader
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

        ColumnTooltipPipe,
    ]
})
export class UniTableModule {}
