import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';

import {AuthService} from '../../authService';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {Observable} from 'rxjs';
import {StatisticsResponse} from '../../models/StatisticsResponse';

@Injectable()
export class BureauCustomHttpService {
    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private browserStorage: BrowserStorageService,
    ) {}

    private getWithoutUnAuthenticatedHandling(url: string, companyKey: string): Observable<any> {
        return this.http.request('get', url, {
            observe: 'response',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.authService.jwt}`,
                'CompanyKey': companyKey,
                'Year': this.getCompanyYear()
            }
        });
    }

    public get(url: string, companyKey: string): Observable<any> {
        return this.getWithoutUnAuthenticatedHandling(url, companyKey)
            .catch((err) => {
                if (err.status === 401) {
                    this.authService.clearAuthAndGotoLogin();
                    return Observable.throw('Sesjonen din er utløpt, vennligst logg inn på ny');
                }

                return Observable.throw(err);
            });
    }

    private getCompanyYear(): string {
        const year = this.browserStorage.getItemFromCompany('activeFinancialYear');
        if (year) {
            return year.Year;
        }
    }

    public statisticsExtractor(response: HttpResponse<any>): any[] {
        const obj: StatisticsResponse = response.body;
        if (!obj.Success) {
            throw new Error(obj.Message);
        }
        return obj.Data;
    }

    public singleStatisticsExtractor(response: HttpResponse<any>): any {
        const obj: StatisticsResponse = response.body;
        if (!obj.Success) {
            throw new Error(obj.Message);
        }
        if (obj.Data[0]) {
            return obj.Data[0];
        }
        throw new Error('No elements found, can not return the first element');
    }
}
