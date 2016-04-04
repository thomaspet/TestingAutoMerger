import {Component} from 'angular2/core';
import {AsyncRoute, ROUTER_DIRECTIVES} from 'angular2/router';
import {Routes} from '../../../route.config';

import {HamburgerMenu} from './hamburgerMenu/hamburgerMenu';
import {UniTabStrip} from './tabstrip/tabstrip';
import {NavbarSearch} from './search/search';
import {UniUserDropdown} from './userInfo/userDropdown/userDropdown';
import {UniCompanyDropdown} from './userInfo/companyDropdown/companyDropdown';

declare var jQuery;

@Component({
    selector: 'uni-navbar',
    templateUrl: 'app/components/layout/navbar/navbar.html',
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
    public routes: AsyncRoute[] = Routes;
}
