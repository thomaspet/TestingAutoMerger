import {AppPipesModule} from '../../pipes/appPipesModule';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniNavbar} from './navbar/navbar';
import {HamburgerMenu} from './navbar/hamburgerMenu/hamburgerMenu';
import {RemoveHidden} from './navbar/hamburgerMenu/hamburgerMenu';
import {NavbarSearch} from './navbar/search/search';
import {UniTabStrip} from './navbar/tabstrip/tabStrip';
import {UniCompanyDropdown} from './navbar/userinfo/companyDropdown/companyDropdown';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTabs} from './uniTabs/uniTabs';
import {UniNumberFormatPipe} from '../../pipes/uniNumberFormatPipe';
import {YearModal, YearModalContent} from './navbar/userinfo/companyDropdown/modals/yearModal';
import {UniHelpText} from './helpText/helpText';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,
        UniFrameworkModule,
        AppPipesModule
    ],
    declarations: [
        UniTabs,
        UniNavbar,
        HamburgerMenu,
        RemoveHidden,
        NavbarSearch,
        UniTabStrip,
        UniCompanyDropdown,
        YearModal,
        YearModalContent,
        UniHelpText
    ],
    providers: [
        UniNumberFormatPipe
    ],
    entryComponents: [
        YearModalContent
    ],
    exports: [
        UniTabs,
        UniNavbar,
        HamburgerMenu,
        RemoveHidden,
        NavbarSearch,
        UniTabStrip,
        UniCompanyDropdown,
        YearModal,
        YearModalContent,
        UniHelpText
    ]
})
export class LayoutModule {}
