import {Injectable} from '@angular/core';
import {CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './authService';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {take, map} from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
    shouldCheckDashboardRedirect = true;

    constructor(
        private authService: AuthService,
        private router: Router,
        private browserStorage: BrowserStorageService,
    ) {
        this.authService.authentication$.subscribe(() => this.shouldCheckDashboardRedirect = true);
    }

    public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // Route user to login if not authenticated and trying to reach protected route
        return this.authService.authentication$.pipe(
            take(1),
            map(auth => {
                if (!auth || !auth.user) {
                    if (state.url.includes('init')) {
                        return true;
                    } else {
                        // Store navigation attempt so we can reroute after login
                        this.browserStorage.setItem('lastNavigationAttempt', state.url);
                        this.router.navigate(['/init/login']);
                    }
                } else {
                    // If routing to the main dashboard, check if the user only has access to
                    // one module. If they do, route to that module's dashboard.
                    // (this check is only performed on load and once after company change)
                    if (this.shouldCheckDashboardRedirect && !state.url || state.url === '/') {
                        const url = this.getMostFittingUrl(auth.user);
                        if (url && state.url && state.url !== url) {
                            this.shouldCheckDashboardRedirect = false;
                            this.router.navigateByUrl(url);
                        }
                    }

                    this.shouldCheckDashboardRedirect = false;
                    return true;
                }
            })
        );
    }

    public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(route, state);
    }

    /**
     * Checks the users access and returns the most fitting redirect url.
     * E.g if a user only has timetracking access we route them to that module.
     */
    private getMostFittingUrl(user) {
        const permissions: string[] = user.Permissions || [];
        if (permissions.length) {

            const moduleUrls = [];
            if (permissions.some(p => p.startsWith('ui_accounting'))) {
                moduleUrls.push('/accounting');
            }

            if (permissions.some(p => p.startsWith('ui_sales'))) {
                moduleUrls.push('/sales');
            }

            if (permissions.some(p => p.startsWith('ui_salary'))) {
                moduleUrls.push('/salary');
            }

            if (permissions.some(p => p.startsWith('ui_timetracking'))) {
                moduleUrls.push('/timetracking');
            }

            if (moduleUrls.length === 1) {
                return moduleUrls[0];
            }

            return '/';
        }
    }
}
