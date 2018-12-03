import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniModal} from './modals/modal';
import {FileSplitModal} from './fileSplit/FileSplitModal';
import {UniSave} from './save/save';
import {UniUploadFileSaveAction} from './save/upload';
import {UniImage} from './uniImage/uniImage';
import {UniToast} from './uniToast/toast';
import {UniToastList} from './uniToast/toastList';
import {StimulsoftReportWrapper} from './wrappers/reporting/reportWrapper';
import {UniPipesModule} from './pipes/pipesModule';
import {UniNotifications} from './notifications/notifications';
import {UniComments} from './comments/comments';
import {CommentService} from './comments/commentService';
import {AppPipesModule} from '../app/pipes/appPipesModule';
import {UniMultiLevelSelect} from './controls/multiLevelSelect';

import {UniAvatar} from './avatar/uniAvatar';
import {UniCommentInput} from './comments/commentInput';
import {UniCommentList} from './comments/commentList';

import {UniSearchModule} from './ui/unisearch/UniSearch.module';
import {UniFormModule} from './ui/uniform/uniform.module';
import {UniTableModule} from './ui/unitable/unitableModule';

import {ClickOutsideDirective} from './core/clickOutside';
import {UniHttp} from './core/http/http';
import {UniComponentLoader} from './core/componentLoader';
import {ComponentCreator} from './core/dynamic/UniComponentCreator';
import {Logger} from './core/logger';

import {ToastService} from './uniToast/toastService';
import {UniModalService, MODALS} from './uni-modal';

import {UniTooltipModule} from './ui/tooltip/tooltip.module';
import {AgGridWrapperModule} from './ui/ag-grid/ag-grid.module';

import {
    MatCheckboxModule,
    MatRadioModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatListModule
} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatRadioModule,
        MatInputModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatStepperModule,
        MatListModule,

        AppPipesModule,
        UniPipesModule,
        UniSearchModule,
        UniTooltipModule,
        UniFormModule,
        UniTableModule,
        AgGridWrapperModule
    ],
    declarations: [
        UniComponentLoader,
        ClickOutsideDirective,
        UniModal,
        UniSave,
        UniUploadFileSaveAction,
        UniImage,
        FileSplitModal,
        UniToast,
        UniToastList,
        UniNotifications,
        UniComments,
        UniMultiLevelSelect,
        UniCommentInput,
        UniCommentList,
        UniAvatar,
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
        // Modules
        UniPipesModule,
        UniSearchModule,
        UniFormModule,
        UniTableModule,
        UniTooltipModule,
        AgGridWrapperModule,

        // Components
        UniModal,
        UniSave,
        UniUploadFileSaveAction,
        UniImage,
        UniToast,
        UniToastList,
        UniNotifications,
        UniComments,
        UniMultiLevelSelect,
        UniCommentInput,
        UniCommentList,
        UniAvatar,

        UniComponentLoader,
        ClickOutsideDirective,

        // Material
        MatCheckboxModule,
        MatRadioModule,
        MatInputModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatStepperModule,
        MatListModule
    ]
})
export class UniFrameworkModule {}

