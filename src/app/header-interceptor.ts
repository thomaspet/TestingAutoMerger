import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from '@app/authService';
import {environment} from 'src/environments/environment';
import {BrowserStorageService} from './services/services';

@Injectable({providedIn: 'root'})
export class HeaderInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService,
        private browserStorage: BrowserStorageService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let headers = request.headers;

        if (!headers.get('Accept')) {
            headers = headers.set('Accept', 'application/json');
        }

        // Figure out if the request is going to an API that uses our auth headers
        const url = request.url;
        const isUniApi = url.startsWith('/api')
            || url.startsWith('api/')
            || url.startsWith('http://localhost')
            || url.startsWith(environment.BASE_URL_INTEGRATION)
            || url.startsWith(environment.BASE_URL_FILES)
            || url.startsWith(environment.UNI_JOB_SERVER_URL)
            || url.startsWith(environment.ELSA_SERVER_URL)
            || url.startsWith(environment.SIGNALR_PUSHHUB_URL);

        if (isUniApi) {
            if (!headers.get('Authorization') && this.authService.jwt) {
                headers = headers.set('Authorization', 'Bearer ' + this.authService.jwt);
            }

            if (!headers.get('CompanyKey') && this.authService.activeCompany) {
                headers = headers.set('CompanyKey', this.authService.activeCompany.Key);
            }

            if (!headers.get('year')) {
                let year = this.browserStorage.getItemFromCompany('activeFinancialYear');
                year = year || this.browserStorage.getItem('ActiveYear');
                if (year) {
                    headers = headers.set('Year', year.Year + '');
                }
            }
        }

        return next.handle(request.clone({
            headers: headers
        }));
    }
}
