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
import {WidgetPoster} from './widgetPoster/widgetPoster';
import {ImageUploader} from './uniImage/imageUploader';
import {ToastService} from './uniToast/toastService';
import {StimulsoftReportWrapper} from './wrappers/reporting/reportWrapper';
import {UniCoreModule} from './core/coreModule';
import {UniPipesModule} from './pipes/pipesModule';
import {Logger} from './core/logger';
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

import {UniModalService, MODALS} from './uniModal/barrel';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UniCoreModule,
        AppPipesModule,
        UniPipesModule,
        UniSearchModule,
        UniFormModule,
        UniTableModule
    ],
    declarations: [
        UniModal,
        UniDocumentList,
        UniDocumentUploader,
        UniSave,
        UniImage,
        UniToast,
        UniToastList,
        UniNotifications,
        UniComments,
        WidgetPoster,
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
        ImageUploader,
        CommentService,
        StimulsoftReportWrapper,
        Logger,
        UniModalService
    ],
    exports: [
        // Modules
        UniCoreModule,
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
        WidgetPoster,
        UniMultiLevelSelect,
        UniCommentInput,
        UniCommentList,
        UniAvatar
    ]
})
export class UniFrameworkModule {}

