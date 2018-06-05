import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppPipesModule} from '../../../app/pipes/appPipesModule';

import {AgGridModule} from 'ag-grid-angular/main';
import {AgGridWrapper} from './ag-grid-wrapper';
import {ColumnMenuNew} from './column-menu-modal';
import {TableDataService} from './services/data-service';
import {TableUtils} from './services/table-utils';
import {TableSearch} from './search/table-search';
import {TableContextMenu} from './context-menu/context-menu';
import {TableEditor} from './editor/editor';

import {TABLE_CONTROLS} from '../unitable/controls';
import {MatMenuModule} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        AppPipesModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        AgGridWrapper,
        TableSearch,
        ColumnMenuNew,
        TableContextMenu,
        TableEditor
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
