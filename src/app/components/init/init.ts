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
    confirmed: boolean = true;

    sbLogo = theme.theme === THEMES.SR;

    private onDestroy$ = new Subject();

    constructor(
        private router: Router,
        public authService: AuthService
    ) {
        this.router.events.pipe(takeUntil(this.onDestroy$)).subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.showTryForFree = theme.theme !== THEMES.UE && theme.theme !== THEMES.EXT02 && !event.url.includes('sign-up');
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
