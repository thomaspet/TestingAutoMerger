import {Component, ChangeDetectionStrategy} from '@angular/core';

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
                <uni-feedback></uni-feedback>
            </div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniNavbar {
}
