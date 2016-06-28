import {Directive, Attribute, ViewContainerRef, DynamicComponentLoader} from '@angular/core';
import {Router, RouterOutlet, ComponentInstruction} from '@angular/router-deprecated';
import {AuthService} from '../framework/core/authService';

@Directive({
    selector: 'uni-router-outlet',
})
export class UniRouterOutlet extends RouterOutlet {
    private parentRouter: Router;
    private authService: AuthService;

    constructor(view: ViewContainerRef,
                loader: DynamicComponentLoader,
                parentRouter: Router,
                @Attribute('name') name: string,
                authService: AuthService) {
        super(view, loader, parentRouter, name);

        this.parentRouter = parentRouter;
        this.authService = authService;
    }

    public activate(instruction: ComponentInstruction) {
        
        if (!this.authService.isAuthenticated() || !this.authService.hasActiveCompany()) {
            let parentInstruction = this.parentRouter.currentInstruction;
            let url = this.getCurrentRoute(parentInstruction);
                        
            if (url !== '/login' && url !== '/signup' && url !== '/reset-password' && url.indexOf('/confirm') === -1) {
                // Add url to last navigation attempt if it doesnt already exist
                // (avoid overriding it in child outlet)
                let lastNavAttempt = localStorage.getItem('lastNavigationAttempt');
                if (!lastNavAttempt || lastNavAttempt === '/') {
                    localStorage.setItem('lastNavigationAttempt', url);
                }
                
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
