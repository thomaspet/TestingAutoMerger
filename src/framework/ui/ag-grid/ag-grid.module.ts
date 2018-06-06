import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppPipesModule} from '../../../app/pipes/appPipesModule';

import {AgGridModule} from 'ag-grid-angular';
import {AgGridWrapper} from './ag-grid-wrapper';
import {ColumnMenuNew} from './column-menu-modal';
import {TableDataService} from './services/data-service';
import {TableUtils} from './services/table-utils';
import {TableSearch} from './search/table-search';
import {TableEditor} from './editor/editor';

import {RowMenuRenderer} from './cell-renderer/row-menu';

import {TABLE_CONTROLS} from '../unitable/controls';
import {MatMenuModule} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        AppPipesModule,
        AgGridModule.withComponents([
            RowMenuRenderer
        ])
    ],
    declarations: [
        AgGridWrapper,
        TableSearch,
        ColumnMenuNew,
        TableEditor,
        RowMenuRenderer
    ],
    entryComponents: [
        ColumnMenuNew,
        ...TABLE_CONTROLS
    ],
    providers: [
        TableUtils,
        TableDataService
    ],
    exports: [
        AgGridWrapper
    ]
})
export class AgGridWrapperModule {}
