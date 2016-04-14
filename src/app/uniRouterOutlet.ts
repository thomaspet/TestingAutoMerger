import {Directive, Attribute, ElementRef, DynamicComponentLoader} from 'angular2/core';
import {Router, RouterOutlet, ComponentInstruction} from 'angular2/router';
import {AuthService} from '../framework/core/authService';

@Directive({
    selector: 'uni-router-outlet',
})
export class UniRouterOutlet extends RouterOutlet {
    private parentRouter: Router;
    private authService: AuthService;

    constructor(elementRef: ElementRef,
                loader: DynamicComponentLoader,
                parentRouter: Router,
                @Attribute('name')
                    nameAttr: string,
                authService: AuthService) {
        super(elementRef, loader, parentRouter, nameAttr);

        this.parentRouter = parentRouter;
        this.authService = authService;
    }

    public activate(instruction: ComponentInstruction) {
        
        if (!this.authService.isAuthenticated()) {
            let parentInstruction = this.parentRouter.currentInstruction;
            // let url = this.getCurrentRoute(parentInstruction);
            let url = '/' + instruction.urlPath;
                  
            if (url !== '/login' && url !== '/signup' && url !== '/reset-password') {
                // Add url to last navigation attempt if it doesnt already exist
                // (avoid overriding it in child outlet)
                let lastNavAttempt = localStorage.getItem('lastNavigationAttempt');
                if (!lastNavAttempt || lastNavAttempt === '/') {
                    localStorage.setItem('lastNavigationAttempt', url);
                }
                
                console.log('renavigating!!', url);
                this.parentRouter.navigateByUrl('/login');
            }
        }

        return super.activate(instruction);
    }
    
    private getCurrentRoute(instruction) {
        var route = '/' + instruction.urlPath;
        
        if (instruction.child) {
            route += this.getCurrentRoute(instruction.child);
        }
        
        return route;
    }

}
