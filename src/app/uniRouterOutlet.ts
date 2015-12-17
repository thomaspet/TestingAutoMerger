import {Directive, Attribute, ElementRef, DynamicComponentLoader} from 'angular2/core';
import {Router, RouterOutlet, ComponentInstruction} from 'angular2/router';
import {AuthService} from '../framework/authentication/authService'
import {Login} from './components/login/login';

@Directive({
	selector: 'uni-router-outlet',
	providers: [AuthService]
})
export class UniRouterOutlet extends RouterOutlet {
	private parentRouter:Router;
	private authService: AuthService;

	constructor(elementRef:ElementRef, loader:DynamicComponentLoader, parentRouter:Router, @Attribute('name') nameAttr:string, authService: AuthService) {
    	super(elementRef, loader, parentRouter, nameAttr);

   		this.parentRouter = parentRouter;
		this.authService = authService;
	}

  	activate(instruction: ComponentInstruction) {
		var url = '/' + instruction.urlPath;
    	
		if (url !== '/login' && !this.authService.authenticated) {
			localStorage.setItem('lastNavigationAttempt', url); // so we can redirect to it after loggin in	
			this.parentRouter.navigateByUrl('/login');
    	}
    	return super.activate(instruction);
	}
}