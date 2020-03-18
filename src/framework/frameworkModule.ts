import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UniModal} from './modals/modal';
import {UniSave} from './save/save';
import {UniImage, EHFViewer} from './uniImage/uniImage';
import {AuthImg} from './uniImage/auth-img/auth-img';
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

import {UniModalService, MODALS, UniShowReinvoiceStatus} from './uni-modal';

import {UniTooltipModule} from './ui/tooltip/tooltip.module';
import {UniDateselectorpModule} from './ui/dateselector/dateselector.module';
import {AgGridWrapperModule} from './ui/ag-grid/ag-grid.module';
import {DropdownMenuModule} from './ui/dropdown-menu/dropdown-menu';
import {ComboButtonModule} from './ui/combo-button/combo-button';

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
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {NgSelectModule} from '@ng-select/ng-select';
import {AutocompleteModule} from './ui/autocomplete/autocomplete.module';
import {UniTabs} from './uni-tabs/uni-tabs';
import {DatepickerModule} from './ui/datepicker/datepicker.module';
import {UniIcon} from './ui/icon/uni-icon';

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
        MatTabsModule,
        DropdownMenuModule,
        ComboButtonModule,
        AutocompleteModule,
        DatepickerModule,
        DragDropModule,
    ],
    declarations: [
        UniComponentLoader,
        UniModal,
        UniSave,
        UniImage,
        AuthImg,
        EHFViewer,
        UniToast,
        UniToastList,
        UniComments,
        UniMultiLevelSelect,
        UniAvatar,
        UniInfo,
        UniShowReinvoiceStatus,
        UniTabs,
        UniIcon,
        ...MODALS
    ],
    entryComponents: [...MODALS],
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
        DropdownMenuModule,
        ComboButtonModule,
        AutocompleteModule,
        DatepickerModule,

        // Components
        UniModal,
        UniSave,
        UniImage,
        AuthImg,
        EHFViewer,
        UniToast,
        UniToastList,
        UniComments,
        UniMultiLevelSelect,
        UniAvatar,
        UniInfo,
        UniShowReinvoiceStatus,
        UniComponentLoader,
        UniTabs,
        UniIcon,

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
        MatChipsModule,
        MatTooltipModule,
        DragDropModule,
    ]
})
export class UniFrameworkModule {}

