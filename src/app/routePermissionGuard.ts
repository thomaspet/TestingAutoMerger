import {Inject} from '@angular/core';
import {UserService} from './services/services';
import {
    Router,
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';
import {Observable} from 'rxjs/Observable';

export class RoutePermissionGuard implements CanActivate, CanActivateChild {
    constructor(
        @Inject(UserService) private userService,
        @Inject(Router) private router
    ) {}

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.userService.getCurrentUser()
            .catch(err => {
                return Observable.of(null);
            })
            .map(user => {
                // Redirect on 401 is handled by UniHttp
                if (!user) {
                    return true;
                }

                let canActivate = this.userService.checkAccessToRoute(state.url, user);

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
