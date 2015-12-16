import {Component, AfterViewInit} from 'angular2/core';
import {Router} from 'angular2/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/observable/fromEvent';

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

    constructor(public router: Router) {
        this.username = JSON.parse(localStorage.getItem('jwt_decoded')).unique_name;
        
        this.dropdownElements = [
            { title: 'Settings',  action: () => { this.navigate('/') } },
            { title: 'Help'    ,  action: () => { this.navigate('/') } },
            { title: 'Log out' ,  action: () => { this.logout() }      },
        ];
                
    }
    
    ngAfterViewInit() {        
        var dropdown = jQuery('#navbar_user_dropdown').hide();
        
        this.clickSubscription =  Observable.fromEvent(document, 'click')
        .subscribe(
            (event: any) => {
                var parentNode = event.target.parentNode;
                if (parentNode && parentNode.tagName === 'UNI-USER-DROPDOWN') {
                    dropdown.toggle();
                } else {
                    dropdown.hide();
                }
            }
        );
    }
    
    navigate(url: string): void {        
        this.router.navigateByUrl(url);
    }
    
    logout(): void {
        // Since /login removes the navbar we need to ubsubscribe to avoid duplicate subscriptions if used logs back in 
        this.clickSubscription.unsubscribe();
        
        localStorage.removeItem('jwt');
        localStorage.removeItem('jwt_decoded');
        this.router.navigateByUrl('/login');
    }
	
}