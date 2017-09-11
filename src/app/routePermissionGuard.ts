import {Inject} from '@angular/core';
import {UserService} from './services/services';
import {
    Router,
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';

export class RoutePermissionGuard implements CanActivate, CanActivateChild {
    constructor(
        @Inject(UserService) private userService,
        @Inject(Router) private router
    ) {}

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.userService.canActivateUrl(state.url).map(canActivate => {
            if (canActivate) {
                return true;
            } else {
                let urlBeforeNavigate = window.location.href.split('/#')[1];

                // User entered the app with this url and needs to be redirected
                if (urlBeforeNavigate === state.url) {
                    this.router.navigateByUrl('/');
                }

                return false;
            }
        });
    }

    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(route, state);
    }
}
