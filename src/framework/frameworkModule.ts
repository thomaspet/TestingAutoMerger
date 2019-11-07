import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniModal} from './modals/modal';
import {FileSplitModal} from './fileSplit/FileSplitModal';
import {UniSave} from './save/save';
import {UniUploadFileSaveAction} from './save/upload';
import {UniImage, EHFViewer} from './uniImage/uniImage';
import {UniToast} from './uniToast/toast';
import {UniToastList} from './uniToast/toastList';
import {StimulsoftReportWrapper} from './wrappers/reporting/reportWrapper';
import {UniPipesModule} from './pipes/pipesModule';
import {UniComments} from './comments/comments';
import {CommentService} from './comments/commentService';
import {AppPipesModule} from '../app/pipes/appPipesModule';
import {UniMultiLevelSelect} from './controls/multiLevelSelect';

import {UniAvatar} from './avatar/uniAvatar';
import {UniInfo} from './uniInfo/uniInfo';

import {ClickOutsideModule} from './click-outside/click-outside.module';
import {UniSearchModule} from './ui/unisearch/UniSearch.module';
import {UniFormModule} from './ui/uniform/uniform.module';
import {UniTableModule} from './ui/unitable/unitableModule';

import {UniHttp} from './core/http/http';
import {UniComponentLoader} from './core/componentLoader';
import {ComponentCreator} from './core/dynamic/UniComponentCreator';
import {Logger} from './core/logger';

import { UniModalService, MODALS, UniShowReinvoiceStatus } from './uni-modal';

import {UniTooltipModule} from './ui/tooltip/tooltip.module';
import {UniDateselectorpModule} from './ui/dateselector/dateselector.module';
import {AgGridWrapperModule} from './ui/ag-grid/ag-grid.module';

import {
    MatCheckboxModule,
    MatRadioModule,
    MatTooltipModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatStepperModule,
    MatListModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTabsModule
} from '@angular/material';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {NgSelectModule} from '@ng-select/ng-select';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatRadioModule,
        MatTooltipModule,
        MatInputModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatStepperModule,
        MatListModule,
        ScrollingModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        MatChipsModule,

        ClickOutsideModule,
        AppPipesModule,
        UniPipesModule,
        UniSearchModule,
        UniTooltipModule,
        UniDateselectorpModule,
        UniFormModule,
        UniTableModule,
        AgGridWrapperModule,
        NgSelectModule,
        MatTabsModule
    ],
    declarations: [
        UniComponentLoader,
        UniModal,
        UniSave,
        UniUploadFileSaveAction,
        UniImage,
        EHFViewer,
        FileSplitModal,
        UniToast,
        UniToastList,
        UniComments,
        UniMultiLevelSelect,
        UniAvatar,
        UniInfo,
        UniShowReinvoiceStatus,
        ...MODALS
    ],
    entryComponents: [
        FileSplitModal,
        ...MODALS
    ],
    providers: [
        UniModalService,
        UniHttp,
        ComponentCreator,
        Logger,
        CommentService,
        StimulsoftReportWrapper,
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,

        // Modules
        UniPipesModule,
        UniSearchModule,
        UniFormModule,
        UniTableModule,
        UniTooltipModule,
        UniDateselectorpModule,
        AgGridWrapperModule,
        ClickOutsideModule,
        NgSelectModule,

        // Components
        UniModal,
        UniSave,
        UniUploadFileSaveAction,
        UniImage,
        EHFViewer,
        UniToast,
        UniToastList,
        UniComments,
        UniMultiLevelSelect,
        UniAvatar,
        UniInfo,
        UniShowReinvoiceStatus,

        UniComponentLoader,

        // Material
        MatCheckboxModule,
        MatRadioModule,
        MatInputModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatStepperModule,
        MatListModule,
        ScrollingModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        MatChipsModule
    ]
})
export class UniFrameworkModule {}

