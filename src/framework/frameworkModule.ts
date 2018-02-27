import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniModal} from './modals/modal';
import {FileSplitModal} from './fileSplit/FileSplitModal';
import {UniDocumentList} from './documents/list';
import {UniDocumentUploader} from './documents/uploader';
import {UniSave} from './save/save';
import {UniUploadFileSaveAction} from './save/upload';
import {UniImage} from './uniImage/uniImage';
import {UniToast} from './uniToast/toast';
import {UniToastList} from './uniToast/toastList';
import {ImageUploader} from './uniImage/imageUploader';
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

import {UniSearchModule} from './ui/unisearch/uniSearch.module';
import {UniFormModule} from './ui/uniform/uniform.module';
import {UniTableModule} from './ui/unitable/unitableModule';

import {ClickOutsideDirective} from './core/clickOutside';
import {UniHttp} from './core/http/http';
import {UniComponentLoader} from './core/componentLoader';
import {ComponentCreator} from './core/dynamic/UniComponentCreator';
import {Logger} from './core/logger';

import {ToastService} from './uniToast/toastService';
import {UniModalService, MODALS} from './uniModal/barrel';

import {UniTooltipModule} from './ui/tooltip/tooltip.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppPipesModule,
        UniPipesModule,
        UniSearchModule,
        UniTooltipModule,
        UniFormModule,
        UniTableModule
    ],
    declarations: [
        UniComponentLoader,
        ClickOutsideDirective,
        UniModal,
        UniDocumentList,
        UniDocumentUploader,
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
        ImageUploader,
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

        // Components
        UniModal,
        UniDocumentList,
        UniDocumentUploader,
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
        ClickOutsideDirective
    ]
})
export class UniFrameworkModule {}

