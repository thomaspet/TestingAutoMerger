import {Injectable} from '@angular/core';
import {Http, Headers, BaseRequestOptions, Request, Response} from '@angular/http';
import {AuthService} from '../../authService';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {Observable} from 'rxjs';
import {ErrorService} from '../../services/common/errorService';
import {StatisticsResponse} from '../../models/StatisticsResponse';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';

@Injectable()
export class BureauCustomHttpService {
    constructor(
        private http: Http,
        private authService: AuthService,
        private browserStorage: BrowserStorageService,
        private errorService: ErrorService,
        private toastService: ToastService,
    ) {}

    public get(url: string, companyKey: string): Observable<any> {
        const token = this.authService.getToken();
        const headers: Headers = new Headers;
        headers.set('Accept', 'application/json');
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('CompanyKey', companyKey);
        headers.set('Year', this.getCompanyYear());
        const options: BaseRequestOptions = new BaseRequestOptions();
        options.method = 'GET';
        options.url = url;
        options.headers = headers;
        options.body = '';
        return this.http.request(new Request(options))
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

    public statisticsExtractor(response: Response): any[] {
        const obj: StatisticsResponse = response.json();
        if (!obj.Success) {
            throw new Error(obj.Message);
        }
        return obj.Data;
    }

    public singleStatisticsExtractor(response: Response): any {
        const obj: StatisticsResponse = response.json();
        if (!obj.Success) {
            throw new Error(obj.Message);
        }
        if (obj.Data[0]) {
            return obj.Data[0];
        }
        throw new Error('No elements found, can not return the first element');
    }
}
