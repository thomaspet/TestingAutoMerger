import {NgModule} from '@angular/core';
import {UniModal} from './modals/modal';
import {UniSave} from './save/save';
import {UniImage, EHFViewer} from './uniImage/uniImage';
import {AuthImg} from './uniImage/auth-img/auth-img';
import {UniToast} from './uniToast/toast';
import {UniToastList} from './uniToast/toastList';
import {StimulsoftReportWrapper} from './wrappers/reporting/reportWrapper';
import {UniPipesModule} from './pipes/pipes.module';
import {UniComments} from './comments/comments';
import {CommentService} from './comments/commentService';
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

import {NgSelectModule} from '@ng-select/ng-select';
import {AutocompleteModule} from './ui/autocomplete/autocomplete.module';
import {UniTabs} from './uni-tabs/uni-tabs';
import {DatepickerModule} from './ui/datepicker/datepicker.module';
import {UniIcon} from './ui/icon/uni-icon';
import {LibraryImportsModule} from '@app/library-imports.module';

@NgModule({
    imports: [
        LibraryImportsModule,
        ClickOutsideModule,
        UniPipesModule,
        UniSearchModule,
        UniTooltipModule,
        UniDateselectorpModule,
        UniFormModule,
        UniTableModule,
        AgGridWrapperModule,
        NgSelectModule,
        DropdownMenuModule,
        ComboButtonModule,
        AutocompleteModule,
        DatepickerModule,
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
        LibraryImportsModule,
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
    ]
})
export class UniFrameworkModule {}

