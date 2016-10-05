import {Component} from '@angular/core';
import {routes} from '../../../routes';


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
    `
})
export class UniNavbar {
    public routes: any[] = routes;
}
