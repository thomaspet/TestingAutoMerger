import {Component, AfterViewInit} from 'angular2/core';
import {Router} from 'angular2/router';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../../../../framework/authentication/authService';
import 'rxjs/add/observable/fromEvent';

declare var jQuery;

interface UserDropdownItem {
    title: String,
    action: Function
}

@Component({
    selector: 'uni-user-dropdown',
    templateUrl: 'app/components/navbar/userinfo/userDropdown/userDropdown.html'
})
export class UserDropdown implements AfterViewInit {
    dropdownElements: Array<UserDropdownItem>;
    username: string;
    clickSubscription: any;
    userDropdownActive: Boolean;

    constructor(private router: Router, private authService: AuthService) {
        this.username = JSON.parse(localStorage.getItem('jwt_decoded')).unique_name;
        this.dropdownElements = [
            { title: 'Settings',  action: () => { this.navigate('/') } },
            { title: 'Help'    ,  action: () => { this.navigate('/') } },
            { title: 'Log out' ,  action: () => { this.logout() }      },
        ];
        this.userDropdownActive = false;
    }
    
    ngAfterViewInit() {
        this.clickSubscription =  Observable.fromEvent(document, 'click')
        .subscribe(
            (event: any) => {
                // Dismiss dropdown on click outside of it
                if (!jQuery(event.target).closest('.navbar_userinfo_user').length &&
                    !jQuery(event.target).closest('.navbar_userinfo_dropdown').length) {
                    this.userDropdownActive = false;
                }
            }
        );
    }
    
    navigate(url: string): void {        
        this.router.navigateByUrl(url);
    }
    
    logout(): void {        
        this.authService.logout();
        this.navigate('/login');
    }
    
    ngOnDestroy() {
        this.clickSubscription.unsubscribe();
    }	
}