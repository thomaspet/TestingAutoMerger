import {Component} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {AuthService} from '../../../../../../framework/core/authService';
import {ClickOutsideDirective} from '../../../../../../framework/core/clickOutside';
import 'rxjs/add/observable/fromEvent';

declare var jQuery;

interface IUniUserDropdownItem {
    title: String;
    action: Function;
}

@Component({
    selector: 'uni-user-dropdown',
    template: `
        <article (clickOutside)="close()" class="navbar_userinfo_user">
            <span class="navbar_userinfo_title" (click)="userDropdownActive = !userDropdownActive">{{username}}</span>

            <ul class="navbar_userinfo_dropdown" [ngClass]="{'-is-active': userDropdownActive}">
                <li *ngFor="let dropdownElement of dropdownElements">
                    <a (click)="dropdownElement.action()">{{dropdownElement.title}}</a>
                </li>
            </ul>
        </article>
    `,
    directives: [ClickOutsideDirective]
})
export class UniUserDropdown {
    private dropdownElements: Array<IUniUserDropdownItem>;
    private username: string;
    private userDropdownActive: boolean;

    constructor(private router: Router, private authService: AuthService) {
        this.username = authService.jwtDecoded.unique_name;
        this.dropdownElements = [
            {
                title: 'Innstillinger', action: () => {
                    this.userDropdownActive = false;
                    this.router.navigateByUrl('/settings/user');
                }
            },
            {
                title: 'Logg ut', action: () => {
                    this.authService.logout();
                }
            },
        ];
        this.userDropdownActive = false;
    }

    private close() {
        this.userDropdownActive = false;
    }
}
