import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
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
import {UniConfirmModal, UniConfirmContent} from './modals/confirm';
import {Logger} from './core/logger';



@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        UniCoreModule,
        UniPipesModule
    ],
    declarations: [
        UniModal,
        UniConfirmModal,
        UniConfirmContent,
        UniDocumentList,
        UniDocumentUploader,
        UniSave,
        UniImage,
        UniToast,
        UniToastList,
        WidgetPoster,
    ],
    entryComponents: [
        UniConfirmContent
    ],
    providers: [
        ImageUploader,
        ToastService,
        StimulsoftReportWrapper,
        Logger
    ],
    exports: [
        // Modules
        UniCoreModule,
        UniPipesModule,

        // Components
        UniModal,
        UniConfirmModal,
        UniConfirmContent,
        UniDocumentList,
        UniDocumentUploader,
        UniSave,
        UniImage,
        UniToast,
        UniToastList,
        WidgetPoster
    ]
})
export class UniFrameworkModule {

}

