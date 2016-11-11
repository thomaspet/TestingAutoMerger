import {AppPipesModule} from './../../pipes/AppPipesModule';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniNavbar} from './navbar/navbar';
import {HamburgerMenu} from './navbar/hamburgerMenu/hamburgerMenu';
import {RemoveHidden} from './navbar/hamburgerMenu/hamburgerMenu';
import {NavbarSearch} from './navbar/search/search';
import {UniTabStrip} from './navbar/tabstrip/tabstrip';
import {UniCompanyDropdown} from './navbar/userinfo/companyDropdown/companyDropdown';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTabs} from './uniTabs/uniTabs';
import {TabService} from './navbar/tabstrip/tabService';


@NgModule({
    imports: [
        BrowserModule,
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
        UniCompanyDropdown
    ],
    providers: [
        TabService
    ],
    exports: [
        UniTabs,
        UniNavbar,
        HamburgerMenu,
        RemoveHidden,
        NavbarSearch,
        UniTabStrip,
        UniCompanyDropdown
    ]
})
export class LayoutModule {}
