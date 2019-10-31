import {Component} from '@angular/core';
import {theme} from 'src/themes/theme';
import {Router, NavigationEnd} from '@angular/router';
import {Subscription, Subject} from 'rxjs';
import {AuthService} from '@app/authService';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'uni-init',
    templateUrl: './init.html',
})
export class UniInit {
    logoUrl = theme.login_logo;

    isAuthenticated: boolean;
    useBackground1 = true;
    background1 = theme.login_background;
    background2 = 'assets/onboarding-background.svg';

    private onDestroy$ = new Subject();

    constructor(
        private router: Router,
        public authService: AuthService
    ) {
        this.router.events.pipe(takeUntil(this.onDestroy$)).subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.useBackground1 = !event.url.includes('register-company');
            }
        });

        this.authService.token$.subscribe(token => this.isAuthenticated = !!token);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
