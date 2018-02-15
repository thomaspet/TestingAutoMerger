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

    public getFileProcessingStatus(id: string): Observable<any> {
        var options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniFilesToken,
                'Key': this.activeCompany.Key
            })
        });

        return this.http
            .get(this.uniFilesBaseUrl + '/api/file/filestatus/' + id, options)
            .map(response => response.json());
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

    public splitFile(fileStorageReference, fromPage, reauthOnFailure: boolean): Promise<any> {
        var options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniFilesToken,
                'Key': this.activeCompany.Key
            })
        });

        return new Promise((resolve, reject) => {
            this.http
                .post(
                    this.uniFilesBaseUrl + `/api/file/split?id=${fileStorageReference}&frompage=${fromPage}`,
                    null,
                    options)
                .map(response => response.json())
                .subscribe(res => {
                        resolve(res);
                    },
                    err => {
                        // if error occurred, try to reauth and retry once
                        if (reauthOnFailure) {
                            this.authService.authenticateUniFiles()
                                .then(() => {
                                    this.splitFile(fileStorageReference, fromPage, false)
                                        .then(retryRes => {
                                            resolve(retryRes);
                                        })
                                        .catch(errRetry => reject(errRetry));
                                })
                                .catch(errReAuth => {
                                    reject(errReAuth);
                                });
                        } else {
                            reject(err);
                        }
                    });
        });
    }
}



