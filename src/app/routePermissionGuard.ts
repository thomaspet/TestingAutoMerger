import { Inject, Injectable } from '@angular/core';
import {AuthService} from './authService';
import {
    Router,
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';

@Injectable()
export class RoutePermissionGuard implements CanActivate, CanActivateChild {
    constructor(
        @Inject(Router) private router,
        @Inject(AuthService) private authService: AuthService
    ) {}

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.authentication$
            .asObservable()
            .take(1)
            .map(auth => {
                let canActivate = this.authService.canActivateRoute(auth.user, state.url);
                /*
                    If user does not have access to the route, check if he entered
                    the app from this url, or if he's already on an allowed route
                    trying to navigate somewhere he does not have permission.

                    If currentUrl === state.url we need to redirect somwhere he has
                    access (dashboard)

                    If currentUrl !== state.url he's already on an allowed route,
                    and we can just return false to stop this navigation attempt

                */
                if (!canActivate) {
                    let currentUrl = window.location.href.split('/#')[1];
                    if (currentUrl === state.url) {
                        this.router.navigateByUrl('/');
                    }
                }

                return canActivate;
            });
    }

    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(route, state);
    }
}
