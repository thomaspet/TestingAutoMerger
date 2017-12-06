import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {environment} from 'src/environments/environment';
import {AuthService} from '../../authService';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class UniFilesService {
    private uniFilesBaseUrl: string = environment.BASE_URL_FILES;
    private uniFilesToken: string;
    private activeCompany: any;

    constructor(private http: Http, private authService: AuthService) {
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

    public trainOcrEngine(ocrInterpretation, reauthOnFailure: boolean = true) {
        var options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniFilesToken,
                'Key': this.activeCompany.Key
            })
        });

        this.http
            .post(
                this.uniFilesBaseUrl + '/api/ocr/train-engine',
                ocrInterpretation,
                options)
            .subscribe(res => {
                    // dont show any updates about this, just let it finish silently
                },
                err => {
                    // if error occurred, try to reauth and retry once
                    if (reauthOnFailure) {
                        this.authService.authenticateUniFiles()
                            .then(() => {
                                this.trainOcrEngine(ocrInterpretation, false);
                            });
                    }
                });
    }
}



