import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'uni-navbar',
    template: `
        <section class="navbar">
            <div class="navbar_content">
                <uni-hamburger-menu></uni-hamburger-menu>
                <uni-shortcut></uni-shortcut>
                <uni-tabstrip></uni-tabstrip>
                <uni-navbar-search></uni-navbar-search>
                <uni-company-dropdown></uni-company-dropdown>
                <div class="nav-link-container" 
                     routerLink="bureau"
                     routerLinkActive="router-link-active">
                    <i class="material-icons">grade</i>
                </div>
                <uni-notifications></uni-notifications>
            </div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniNavbar {
}
