import {Component, AfterViewInit} from 'angular2/angular2';
import {Router} from 'angular2/router';

@Component({
    selector: 'uni-user-dropdown',
    templateUrl: 'app/components/navbar/userinfo/userDropdown/userDropdown.html'
})
export class UserDropdown implements AfterViewInit {
    dropdownIsOpen: boolean;
    dropdownElements: Array<any>;
    loggedInAs: string;

    constructor(public router: Router) {
        this.dropdownIsOpen = false;
        this.dropdownElements = this.getDropdownElements();
        this.loggedInAs = this.getLoggedInAs();
    }

    //Should this be generic, or does users have different options here?
    getDropdownElements(): Array<any> {

        return [
            { name: 'Min side', href: '/uniformdemo' },
            { name: 'Innstillinger', href: '/kitchensink' },
            { name: 'Hjelp', href: '/' },
            { name: 'Noe annet', href: '/kitchensink' },
            { name: 'Logg ut', href: '/login' },
        ];
    }

    getLoggedInAs(): string {
        //Where to get logged in users full name? Is that going to be in the token?
        var user = JSON.parse(localStorage.getItem('jwt_decoded'));
        if (user) {
            return user.unique_name;
        } else {
            return 'Ola Nordmann';
        }
    }

    onUserRouteSelected(action, e): void {
        event.preventDefault();

        this.dropdownIsOpen = false;
        this.router.navigateByUrl(action.href);	
    }
	
	ngAfterViewInit() {}
}