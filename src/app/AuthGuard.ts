import {Injectable} from '@angular/core';
import {CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../framework/core/authService';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) {}

    public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {        
        // Route user to login if not authenticated and trying to reach protected route
        if (!this.authService.isAuthenticated() || !this.authService.hasActiveCompany()) {
            if (!next.url.length || next.url[0].path !== 'init') {
                // Store navigation attempt so we can reroute after login
                localStorage.setItem('lastNavigationAttempt', state.url);
                this.router.navigate(['/init/login']);
                return false;
            }
        }

        return true;
    }

    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }
}
