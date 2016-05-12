import {Component} from '@angular/core';
import {AsyncRoute, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {ROUTES} from '../../../route.config';

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
    public routes: AsyncRoute[] = ROUTES;
}
