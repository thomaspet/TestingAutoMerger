import {Component} from '@angular/core';
import {Route, ROUTER_DIRECTIVES} from '@angular/router';
import {routes} from '../../../routes';

import {HamburgerMenu} from './hamburgerMenu/hamburgerMenu';
import {UniTabStrip} from './tabstrip/tabstrip';
import {NavbarSearch} from './search/search';
import {UniUserDropdown} from './userInfo/userDropdown/userDropdown';
import {UniCompanyDropdown} from './userInfo/companyDropdown/companyDropdown';


@Component({
    selector: 'uni-navbar',
    template: `
        <section class="navbar">
            <div class="navbar_content">
                <uni-hamburger-menu></uni-hamburger-menu>
                <uni-tabstrip></uni-tabstrip>
                <uni-navbar-search></uni-navbar-search>
                <div class="navbar_userinfo">
                    <uni-user-dropdown></uni-user-dropdown>
                    <uni-company-dropdown></uni-company-dropdown>
                </div>
            </div>
        </section>
    `,
    directives: [
        ROUTER_DIRECTIVES,
        HamburgerMenu,
        UniTabStrip,
        NavbarSearch,
        UniUserDropdown,
        UniCompanyDropdown
    ]
})
export class UniNavbar {
    public routes: any[] = routes;
}
