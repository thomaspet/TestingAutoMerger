import {Inject} from '@angular/core';
import {UserService} from './services/services';
import {
    Router,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';

export class CanActivateGuard implements CanActivateChild {
    constructor(
        @Inject(UserService) private userService,
        @Inject(Router) private router
    ) {}

    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
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
}
