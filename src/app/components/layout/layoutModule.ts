import {NgModule, ModuleWithProviders} from '@angular/core';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniNavbar} from './navbar/navbar';
import {UniSidebar} from './sidebar/sidebar';
import {HamburgerMenu, RemoveHidden} from './navbar/hamburgerMenu/hamburgerMenu';
import {HorizontalNavbar} from './navbar/horizontal-nav/horizontal-nav';
import {NavbarCreateNew} from './navbar/create-new/navbar-create-new';
import {NavbarSearch} from './navbar/search/search';
import {UniTabStrip} from './navbar/tabstrip/tabStrip';
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
import {
    MatTabsModule,
    MatTooltipModule,
    MatMenuModule,
    MatExpansionModule
} from '@angular/material';

@NgModule({
    imports: [
        MatTabsModule,
        MatTooltipModule,
        MatMenuModule,
        MatExpansionModule,

        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,
        UniFrameworkModule,
        AppPipesModule
    ],
    declarations: [
        HorizontalNavbar,
        UniTabs,
        UniNavbar,
        UniSidebar,
        HamburgerMenu,
        RemoveHidden,
        NavbarCreateNew,
        NavbarSearch,
        UniTabStrip,
        UniTabstripHelp,
        UniCompanyDropdown,
        NavbarUserDropdown,
        UserSettingsModal,
        YearModal,
        UniHelpText
    ],
    providers: [
        UniNumberFormatPipe
    ],
    entryComponents: [
        YearModal,
        UserSettingsModal
    ],
    exports: [
        HorizontalNavbar,
        UniTabs,
        UniNavbar,
        UniSidebar,
        HamburgerMenu,
        RemoveHidden,
        NavbarCreateNew,
        NavbarSearch,
        UniTabStrip,
        UniTabstripHelp,
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
