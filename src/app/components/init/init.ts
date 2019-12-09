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
    useBackground1 = true;
    showTryForFree = true;
    background1 = theme.login_background;
    background2 = 'assets/onboarding-background.svg';

    background;
    fullWidthBackground: boolean;


    private onDestroy$ = new Subject();

    constructor(
        private router: Router,
        public authService: AuthService
    ) {
        this.router.events.pipe(takeUntil(this.onDestroy$)).subscribe(event => {
            if (event instanceof NavigationEnd) {

                if (environment.isSrEnvironment) {
                    if (event.url.includes('register-company')) {
                        this.background = 'assets/onboarding-background.svg';
                        this.fullWidthBackground = false;
                    } else {
                        this.background = theme.login_background;
                        this.fullWidthBackground = true;
                    }
                } else {
                    this.background = 'assets/onboarding-background.svg';
                    this.fullWidthBackground = false;
                }

                this.useBackground1 = !event.url.includes('register-company');
                this.showTryForFree = !event.url.includes('sign-up');
            }
        });

        this.authService.token$.pipe(takeUntil(this.onDestroy$)).subscribe(token => this.isAuthenticated = !!token);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
