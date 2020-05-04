import {Component} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {Subject} from 'rxjs';
import {AuthService} from '@app/authService';
import {takeUntil} from 'rxjs/operators';
import {environment} from 'src/environments/environment';

@Component({
    selector: 'uni-init',
    templateUrl: './init.html',
})
export class UniInit {
    isAuthenticated: boolean;
    showTryForFree = true;

    isSrEnvironment = environment.isSrEnvironment;

    private onDestroy$ = new Subject();

    constructor(
        private router: Router,
        public authService: AuthService
    ) {
        this.router.events.pipe(takeUntil(this.onDestroy$)).subscribe(event => {
            if (event instanceof NavigationEnd) {
                // Only showing the link in SR env for now. Might also be made visible for UE users later.
                this.showTryForFree = this.isSrEnvironment && !event.url.includes('sign-up');
            }
        });

        this.authService.token$.pipe(takeUntil(this.onDestroy$)).subscribe(token => this.isAuthenticated = !!token);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    logout() {
        this.authService.idsLogout();
    }
}
