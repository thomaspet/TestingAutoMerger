import {Injectable} from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../framework/core/authService';

@Injectable()
export class AuthGuard implements CanActivate {
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
    
    private storeLastUrl(url) {
        let lastNavAttempt = localStorage.getItem('lastNavigationAttempt');
        if (!lastNavAttempt || lastNavAttempt === '/') {
            localStorage.setItem('lastNavigationAttempt', url);
        }
    }
}
