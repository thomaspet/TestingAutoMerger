import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniModal} from './modals/modal';
import {UniDocumentList} from './documents/list';
import {UniDocumentUploader} from './documents/uploader';
import {UniSave} from './save/save';
import {UniForm} from './uniform/uniform';
import {UniImage} from './uniImage/uniImage';
import {UniToast} from './uniToast/toast';
import {UniToastList} from './uniToast/toastList';
import {WidgetPoster} from './widgetPoster/widgetPoster';
import {ImageUploader} from './uniImage/imageUploader';
import {ToastService} from './uniToast/toastService';
import {StimulsoftReportWrapper} from './wrappers/reporting/reportWrapper';
import {UniCoreModule} from './core/coreModule';
import {UniPipesModule} from './pipes/pipesModule';
import {UniSelect} from './uniform/controls/select/select';
import {UniField} from './uniform/unifield';
import {UniCombo} from './uniform/unicombo';
import {UniFieldSet} from './uniform/unifieldset';
import {UniSection} from './uniform/unisection';
import {CONTROLS} from './uniform/controls/index';
import {ShowError} from './uniform/showError';
import {UniCalendar} from './uniform/controls/date/calendar';
import {UniLineBreak} from './uniform/unilinebreak';
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
        UniForm,
        UniImage,
        UniToast,
        UniToastList,
        WidgetPoster,
        UniSelect,
        UniCalendar,
        UniField,
        UniCombo,
        UniFieldSet,
        UniSection,
        ShowError,
        UniLineBreak,
        CONTROLS
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
        UniForm,
        UniImage,
        UniToast,
        UniToastList,
        WidgetPoster,
        UniSelect
    ]
})
export class UniFrameworkModule {

}

