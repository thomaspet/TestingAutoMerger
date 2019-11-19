import {Injectable} from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';

import {Observable} from 'rxjs';
import {AuthService} from '@app/authService';

@Injectable({providedIn: 'root'})
export class HeaderInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let headers = request.headers;

        if (!headers.has('Authorization') && this.authService.jwt) {
            headers = headers.set('Authorization', 'Bearer ' + this.authService.jwt);
        }

        // if (!headers.has('CompanyKey') && this.authService.activeCompany) {
        //     headers = headers.set('CompanyKey', this.authService.activeCompany.Key);
        // }

        return next.handle(request.clone({
            headers: headers
        }));
    }
}
