import { Injectable } from '@angular/core';
import { UniHttp } from '../../../framework/core/http/http';
import { AuthService } from '../../../framework/core/authService';
import { YearService } from '../../services/services';


@Injectable()
export class WidgetDataService {

    constructor(
        private http: UniHttp,
        private authService: AuthService,
        private yearService: YearService) { }

    public getData(endpoint: string) {
        // Should probably move these to separate functions if more replaces are needed
        if (endpoint.includes('<userID>')) {
            endpoint = endpoint.replace('<userID>', this.authService.getTokenDecoded().nameid);
        }

        if (endpoint.includes('<year>')) {
            return this.yearService.getActiveYear()
                .switchMap((year) => {
                    return this.http
                        .asGET()
                        .usingEmptyDomain()
                        .withEndPoint(endpoint.replace('<year>', year.toString()))
                        .send()
                        .map(response => response.json());
                }
                );
        }

        return this.http
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(endpoint)
            .send()
            .map(response => response.json());
    }
}