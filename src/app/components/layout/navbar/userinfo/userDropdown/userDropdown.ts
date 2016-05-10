import {Component, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../../../../../framework/core/authService';
import 'rxjs/add/observable/fromEvent';

declare var jQuery;

interface IUniUserDropdownItem {
    title: String;
    action: Function;
}

@Component({
    selector: 'uni-user-dropdown',
    templateUrl: 'app/components/layout/navbar/userinfo/userDropdown/userDropdown.html'
})
export class UniUserDropdown implements AfterViewInit {
    dropdownElements: Array<IUniUserDropdownItem>;
    username: string;
    clickSubscription: any;
    userDropdownActive: Boolean;

    constructor(private router: Router, private authService: AuthService) {
        this.username = authService.jwtDecoded.unique_name;
        this.dropdownElements = [
            {
                title: "Settings", action: () => {
                this.navigate("/settings");
            }
            },
            {
                title: "Help", action: () => {
                this.navigate("/");
            }
            },
            {
                title: "Log out", action: () => {
                this.authService.logout();
            }
            },
        ];
        this.userDropdownActive = false;
    }

    ngAfterViewInit() {
        this.clickSubscription = Observable.fromEvent(document, "click")
            .subscribe(
                (event: any) => {
                    // dismiss dropdown on click outside of it
                    if (!jQuery(event.target).closest(".navbar_userinfo_user").length
                        && !jQuery(event.target).closest(".navbar_userinfo_dropdown").length) {
                        this.userDropdownActive = false;
                    }
                }
            );
    }

    navigate(url: string): void {
        this.router.navigateByUrl(url);
    }

    ngOnDestroy() {
        this.clickSubscription.unsubscribe();
    }
}