import {Injectable} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {theme, THEMES} from 'src/themes/theme';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class CelebrusService {

    constructor(
        private router: Router
    ) {

        if (theme.theme === THEMES.EXT02) {
            const scriptEl = window.document.createElement('script');

            let scriptSrc = '//assets.adobedtm.com/launch-ENc1ea418100f34978ac7de0baf3824e2f-development.min.js';

            if (environment.useProdMode) {
                scriptSrc = '//assets.adobedtm.com/launch-ENabbbd2c3cb0e4f5f8591b5bbac1280ff.min.js';
            }

            scriptEl.src = scriptSrc;
            scriptEl.async = true;

            window.document.head.appendChild(scriptEl);

            // Route handler that pushes pageload to the datalayer stack
            this.router.events.pipe(
                filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            ).subscribe(e => {
                if (this.router.url?.includes('sign-up')) {
                    return;
                }
                this.useDataLayer('PageLoaded', {});
            });
        }
    }

    public useDataLayer(event: string, page: any = null, products: any[] = null) {
        window.dnbDataLayer = window.dnbDataLayer || [];
        window.dnbDataLayer.push( {event, page, products } );
    }
}
