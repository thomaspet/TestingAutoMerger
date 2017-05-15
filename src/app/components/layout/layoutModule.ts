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
import {UniFeedback} from '../common/feedback/feedback';
import {UniFormModule} from 'uniform-ng2/main';
import { UniNumberFormatPipe } from '../../pipes/uniNumberFormatPipe';
import { YearModal, YearModalContent } from "./navbar/userinfo/companyDropdown/modals/yearModal";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,
        UniFrameworkModule,
        AppPipesModule,
        UniFormModule
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
        UniFeedback
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
        UniFeedback
    ]
})
export class LayoutModule {
}
