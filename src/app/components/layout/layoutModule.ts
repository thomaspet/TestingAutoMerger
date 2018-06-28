import {NgModule, ModuleWithProviders} from '@angular/core';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniNavbar} from './navbar/navbar';
import {UniSidebar} from './sidebar/sidebar';
import {NavbarCreateNew} from './navbar/create-new/navbar-create-new';
import {NavbarSearch} from './navbar/search/search';
import {UniTabStrip} from './navbar/tabstrip/tabstrip';
import {UniTabstripHelp} from './navbar/tabstrip/help';
import {UniCompanyDropdown} from './navbar/company-dropdown/companyDropdown';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTabs} from './uniTabs/uniTabs';
import {UniNumberFormatPipe} from '../../pipes/uniNumberFormatPipe';
import {YearModal} from './navbar/company-dropdown/yearModal';
import {UniHelpText} from './helpText/helpText';
import {NavbarLinkService} from './navbar/navbar-link-service';

import {NavbarUserDropdown} from './navbar/user-dropdown/user-dropdown';
import {UserSettingsModal} from './navbar/user-dropdown/user-settings-modal';

import {UniMegaMenu} from './navbar/mega-menu/mega-menu';

import {UniSmartSearch} from './smart-search/smart-search';
import {UniSmartSearchItem} from './smart-search/smart-search-item';
import {SmartSearchService} from './smart-search/smart-search.service';

import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';

import {
    MatTabsModule,
    MatTooltipModule,
    MatMenuModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule
} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        A11yModule,
        OverlayModule,
        MatTabsModule,
        MatTooltipModule,
        MatMenuModule,
        MatExpansionModule,
        MatIconModule,
        MatButtonModule,
        MatProgressBarModule,

        UniFrameworkModule,
        AppPipesModule
    ],
    declarations: [
        UniTabs,
        UniNavbar,
        UniSidebar,
        UniMegaMenu,
        NavbarCreateNew,
        NavbarSearch,
        UniTabStrip,
        UniTabstripHelp,
        UniCompanyDropdown,
        NavbarUserDropdown,
        UserSettingsModal,
        YearModal,
        UniHelpText,
        UniSmartSearch,
        UniSmartSearchItem
    ],
    providers: [
        UniNumberFormatPipe,
        SmartSearchService
    ],
    entryComponents: [
        YearModal,
        UserSettingsModal,
        UniSmartSearch
    ],
    exports: [
        UniTabs,
        UniNavbar,
        UniSidebar,
        NavbarCreateNew,
        NavbarSearch,
        UniCompanyDropdown,
        YearModal,
        UniHelpText
    ]
})
export class LayoutModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: LayoutModule,
            providers: [NavbarLinkService]
        };
    }
}
