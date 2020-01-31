import {Component} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {Subject} from 'rxjs';
import {AuthService} from '@app/authService';
import {takeUntil} from 'rxjs/operators';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'uni-init',
    templateUrl: './init.html',
})
export class UniInit {
    isAuthenticated: boolean;
    showTryForFree = true;

    isSrEnvironment = theme.theme === THEMES.SR;
    illustration: string;
    background: string;
    backgroundHeight = theme.init.backgroundHeight;

    private onDestroy$ = new Subject();

    confirmed: boolean = true;

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
