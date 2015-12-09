import {Component, AfterViewInit} from 'angular2/angular2';

@Component({
	selector: 'user-dropdown',
	templateUrl: 'app/components/navbar/userinfo/user/userDropdown.html',
})
export class UserDropdown implements AfterViewInit {
	dropdownIsOpen: boolean;
	dropdownElements: Array<any>; // todo: type this
	
	constructor() {
		this.dropdownIsOpen = false;
		this.dropdownElements = [
			'Brukerinfo',
			'Logg ut'
		]
	}
	
	ngAfterViewInit() {}
}