import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    MatDatepickerModule,
    MatNativeDateModule,
    DateAdapter,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule
} from '@angular/material';

import {AppPipesModule} from '../../../app/pipes/appPipesModule';

import {AgGridModule} from 'ag-grid-angular';
import {AgGridWrapper} from './ag-grid-wrapper';
import {ColumnMenuNew} from './column-menu-modal';
import {TableDataService} from './services/data-service';
import {TableUtils} from './services/table-utils';
import {TableEditor} from './editor/editor';
import {TableFilters} from './filters/filters';
import {AdvancedFilters} from './filters/advanced-filters/advanced-filters';

import {RowMenuRenderer} from './cell-renderer/row-menu';
import {StatusCellRenderer} from './cell-renderer/status-cell';
import {TABLE_CONTROLS} from '../unitable/controls';
import {UniDateAdapter} from '@app/date-adapter';
import {DropdownMenuModule} from '../dropdown-menu/dropdown-menu';
import {InputDropdownModule} from '../input-dropdown/input-dropdown';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        AppPipesModule,
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
        TableFilters,
        AdvancedFilters
    ],
    entryComponents: [
        ColumnMenuNew,
        AdvancedFilters,
        ...TABLE_CONTROLS
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
