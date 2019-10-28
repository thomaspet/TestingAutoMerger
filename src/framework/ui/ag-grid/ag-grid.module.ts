import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    MatMenuModule, MatDatepickerModule, MatNativeDateModule, DateAdapter, MatAutocompleteModule,
    MatProgressSpinnerModule
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
import {TABLE_CONTROLS} from '../unitable/controls';
import {UniDateAdapter} from '@app/date-adapter';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        AppPipesModule,
        AgGridModule.withComponents([
            RowMenuRenderer
        ])
    ],
    declarations: [
        AgGridWrapper,
        ColumnMenuNew,
        TableEditor,
        RowMenuRenderer,
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
