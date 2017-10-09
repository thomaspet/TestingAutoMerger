import {Injectable} from '@angular/core';
import {CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './authService';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) {}

    public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // Route user to login if not authenticated and trying to reach protected route
        return this.authService.authentication$
            .asObservable()
            .map((authDetails) => {
                if (!authDetails.user && state.url.indexOf('init') < 0) {
                    // Store navigation attempt so we can reroute after login
                    localStorage.setItem('lastNavigationAttempt', state.url);
                    this.router.navigate(['/init/login']);
                    return false;
                } else {
                    return true;
                }
            });
    }

    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(route, state);
    }
}
