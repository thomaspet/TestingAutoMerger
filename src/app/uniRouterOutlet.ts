import {Directive, Attribute, ElementRef, DynamicComponentLoader} from 'angular2/core';
import {Router, RouterOutlet, ComponentInstruction} from 'angular2/router';
import {Login} from './components/login/login';

@Directive({
	selector: 'uni-router-outlet'
})
export class UniRouterOutlet extends RouterOutlet {
	private parentRouter:Router;

	constructor(_elementRef:ElementRef, _loader:DynamicComponentLoader, _parentRouter:Router, @Attribute('name') nameAttr:string) {
    	super(_elementRef, _loader, _parentRouter, nameAttr);

   		this.parentRouter = _parentRouter;
	}

  	activate(instruction: ComponentInstruction) {
		var url = '/' + instruction.urlPath;
    	// var url = this.parentRouter.lastNavigationAttempt;
    	
		if (url !== '/login' && !localStorage.getItem('jwt')) {
			localStorage.setItem('lastNavigationAttempt', url); // so we can redirect to it after loggin in	
			this.parentRouter.navigateByUrl('/login');
    	}
    	return super.activate(instruction);
	}
}