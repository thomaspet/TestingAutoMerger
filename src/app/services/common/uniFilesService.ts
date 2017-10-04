import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppConfig} from '../../AppConfig';
import {AuthService} from '../../authService';

@Injectable()
export class UniFilesService {
    private uniFilesBaseUrl: string = AppConfig.BASE_URL_FILES;
    private uniFilesToken: string;
    private activeCompany: any;

    constructor(private http: Http, authService: AuthService) {
        authService.authentication$.subscribe((authDetails) => {
            this.activeCompany = authDetails.activeCompany;
        });

        authService.filesToken$.subscribe(token => this.uniFilesToken = token);
    }

    public syncUniEconomyCompanySettings() {
        var options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniFilesToken,
                'Key': this.activeCompany.Key
            })
        });

        this.http
            .get(this.uniFilesBaseUrl + '/api/client/sync-ue-client-data', options)
            .subscribe((res) => {
                console.log('settings synced to unifiles');
            }, err => {
                // ignore error here - usually it wont matter much for the user anyway
                console.log('error syncing settings to uni files', err);
            });
    }

    public checkAuthentication(): Promise<boolean> {
        var options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniFilesToken,
                'Key': this.activeCompany.Key
            })
        });

        return new Promise<boolean>((resolve, reject) => {
            this.http
                .get(this.uniFilesBaseUrl + '/api/init/check-auth', options)
                .subscribe((res) => {
                    resolve(true);
                }, err => {
                    reject('Not authenticated');
                });
        });
    }
}



