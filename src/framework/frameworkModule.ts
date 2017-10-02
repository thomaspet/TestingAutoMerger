import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniModal} from './modals/modal';
import {UniDocumentList} from './documents/list';
import {UniDocumentUploader} from './documents/uploader';
import {UniSave} from './save/save';
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

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppPipesModule,
        UniPipesModule,
        UniSearchModule,
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
        UniImage,
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
        ...MODALS
    ],
    providers: [
        ToastService,
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

        // Components
        UniModal,
        UniDocumentList,
        UniDocumentUploader,
        UniSave,
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

