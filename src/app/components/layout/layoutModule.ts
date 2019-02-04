import {NgModule, ModuleWithProviders} from '@angular/core';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniNavbar} from './navbar/navbar';
import {UniSidebar} from './sidebar/sidebar';
import {NavbarCreateNew} from './navbar/create-new/navbar-create-new';
import {UniTabStrip} from './navbar/tabstrip/tabstrip';
import {UniTabstripHelp} from './navbar/tabstrip/help';
import {UniCompanyDropdown} from './navbar/company-dropdown/companyDropdown';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTabs} from './uniTabs/uniTabs';
import {UniNumberFormatPipe} from '../../pipes/uniNumberFormatPipe';
import {YearModal} from './navbar/company-dropdown/yearModal';
import {NavbarLinkService} from './navbar/navbar-link-service';

import {NavbarUserDropdown} from './navbar/user-dropdown/user-dropdown';
import {UserSettingsModal} from './navbar/user-dropdown/user-settings-modal';

import {UniMegaMenu} from './navbar/mega-menu/mega-menu';

import {UniCompanySearch} from './smart-search/company-search/company-search';
import {UniSmartSearch} from './smart-search/smart-search';
import {UniSmartSearchItem} from './smart-search/smart-search-item';
import {SmartSearchService} from './smart-search/smart-search.service';
import {SmartSearchDataService} from './smart-search/smart-search-data.service';

import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';

import {NotificationsModule} from './notifications/notifications.module';

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
        AppPipesModule,
        NotificationsModule
    ],
    declarations: [
        UniTabs,
        UniNavbar,
        UniSidebar,
        UniMegaMenu,
        NavbarCreateNew,
        UniTabStrip,
        UniTabstripHelp,
        UniCompanyDropdown,
        NavbarUserDropdown,
        UserSettingsModal,
        YearModal,
        UniCompanySearch,
        UniSmartSearch,
        UniSmartSearchItem
    ],
    providers: [
        UniNumberFormatPipe,
        SmartSearchService,
        SmartSearchDataService
    ],
    entryComponents: [
        YearModal,
        UserSettingsModal,
        UniCompanySearch,
        UniSmartSearch
    ],
    exports: [
        UniTabs,
        UniNavbar,
        UniSidebar,
        NavbarCreateNew,
        UniCompanyDropdown,
        YearModal,
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
