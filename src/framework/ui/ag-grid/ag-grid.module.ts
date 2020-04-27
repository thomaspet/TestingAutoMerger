import {NgModule} from '@angular/core';
import {MatNativeDateModule, DateAdapter} from '@angular/material/core';
import {LibraryImportsModule} from '@app/library-imports.module';

import {UniPipesModule} from '../../pipes/pipes.module';
import {AgGridModule} from 'ag-grid-angular';
import {AgGridWrapper} from './ag-grid-wrapper';
import {ColumnMenuNew} from './column-menu-modal';
import {TableDataService} from './services/data-service';
import {TableUtils} from './services/table-utils';
import {TableEditor} from './editor/editor';
import {TableFiltersAndButtons} from './filters/filters-and-buttons';
import {AdvancedFilters} from './filters/advanced-filters/advanced-filters';

import {RowMenuRenderer} from './cell-renderer/row-menu';
import {StatusCellRenderer} from './cell-renderer/status-cell';
import {UniDateAdapter} from '@app/date-adapter';
import {DropdownMenuModule} from '../dropdown-menu/dropdown-menu';
import {InputDropdownModule} from '../input-dropdown/input-dropdown';
import {QuickFilters} from './filters/quick-filters/quick-filters';
import {DatepickerModule} from '../datepicker/datepicker.module';
import {TableLoadIndicator} from './table-load-indicator';

@NgModule({
    imports: [
        LibraryImportsModule,
        MatNativeDateModule,
        DatepickerModule,

        UniPipesModule,
        DropdownMenuModule,
        InputDropdownModule,
        AgGridModule.withComponents([
            RowMenuRenderer,
            StatusCellRenderer
        ])
    ],
    declarations: [
        AgGridWrapper,
        ColumnMenuNew,
        TableEditor,
        RowMenuRenderer,
        StatusCellRenderer,
        TableFiltersAndButtons,
        AdvancedFilters,
        QuickFilters,
        TableLoadIndicator,
    ],
    providers: [
        TableUtils,
        TableDataService,

        { provide: DateAdapter, useClass: UniDateAdapter },
    ],
    exports: [
        AgGridWrapper
    ]
})
export class AgGridWrapperModule {}
