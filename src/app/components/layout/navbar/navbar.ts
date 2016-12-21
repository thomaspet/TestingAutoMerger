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
                <uni-company-dropdown></uni-company-dropdown>
                <uni-notifications></uni-notifications>
            </div>
        </section>
    `
})
export class UniNavbar {
    public routes: any[] = routes;
}
