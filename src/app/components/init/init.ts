import {Component} from '@angular/core';
import {theme} from 'src/themes/theme';
import {Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
    selector: 'uni-init',
    templateUrl: './init.html',
})
export class UniInit {
    logoUrl = theme.login_logo;

    useBackground1 = true;
    background1 = theme.login_background;
    background2 = 'assets/onboarding-background.svg';

    private routerSubscription: Subscription;

    constructor(private router: Router) {
        this.routerSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.useBackground1 = !event.url.includes('register-company');
            }
        });
    }

    ngOnDestroy() {
        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
        }
    }
}
