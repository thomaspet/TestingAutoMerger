import {Component} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {Subject} from 'rxjs';
import {AuthService} from '@app/authService';
import {takeUntil} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'uni-init',
    templateUrl: './init.html',
})
export class UniInit {
    isAuthenticated: boolean;
    showTryForFree = true;

    isSrEnvironment = environment.isSrEnvironment;
    illustration: string;
    background: string;
    backgroundHeight = theme.init.backgroundHeight;

    private onDestroy$ = new Subject();

    constructor(
        private router: Router,
        public authService: AuthService
    ) {
        this.router.events.pipe(takeUntil(this.onDestroy$)).subscribe(event => {
            if (event instanceof NavigationEnd) {
                if (event.url.includes('login') && theme.init.login_background) {
                    this.background = theme.init.login_background;
                    this.illustration = undefined;
                } else {
                    this.background = theme.init.background;
                    this.illustration = theme.init.illustration;
                }

                this.showTryForFree = !event.url.includes('sign-up');
            }
        });

        this.authService.token$.pipe(takeUntil(this.onDestroy$)).subscribe(token => this.isAuthenticated = !!token);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    logout() {
        this.authService.clearAuthAndGotoLogin(true);
    }
}
