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
        const options = new RequestOptions({
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
        const options = new RequestOptions({
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

    public forceFullLoad(id: string, reauthOnFailure: boolean = true): Observable<any> {
        const options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniFilesToken,
                'Key': this.activeCompany.Key
            })
        });

        return this.http.get(this.uniFilesBaseUrl + '/api/file/force-full-load/' + id, options)
            .catch(err => {
            if (err.status === 401 && reauthOnFailure) {
                return Observable.fromPromise(this.authService.authenticateUniFiles())
                    .switchMap(() => this.forceFullLoad(id, false));
            } else {
                return Observable.throw(err);
            }
        });
    }

    public getFileSplitList(id: string, reauthOnFailure: boolean = true): Observable<any> {
        const options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniFilesToken,
                'Key': this.activeCompany.Key
            })
        });

        return this.http.get(this.uniFilesBaseUrl + '/api/file/get-page-split-info/' + id, options)
            .catch(err => {
            if (err.status === 401 && reauthOnFailure) {
                return Observable.fromPromise(this.authService.authenticateUniFiles())
                    .switchMap(() => this.getFileSplitList(id, false));
            } else {
                return Observable.throw(err);
            }
        }).map(res => res.json());
    }

    public rotate(id: string, page: number, rotateClockwise: boolean): Observable<any> {
        const options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniFilesToken,
                'Key': this.activeCompany.Key
            })
        });

        return this.http
            .get(this.uniFilesBaseUrl + `/api/file/rotate-page/${id}/${page}/${rotateClockwise}`, options);
    }

    public getFileProcessingStatus(id: string): Observable<any> {
        const options = new RequestOptions({
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

    public getOcrStatistics(): Observable<any> {
        const options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniFilesToken,
                'Key': this.activeCompany.Key
            })
        });

        return this.http
            .get(this.uniFilesBaseUrl + '/api/client/get-ocr-stats', options)
            .map(response => response.json());
    }



    public trainOcrEngine(ocrInterpretation, reauthOnFailure: boolean = true) {
        const options = new RequestOptions({
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
                    if (err.status === 401 && reauthOnFailure) {
                        this.authService.authenticateUniFiles()
                            .then(() => {
                                this.trainOcrEngine(ocrInterpretation, false);
                            });
                    }
                });
    }

    public splitFileMultiple(
        fileStorageReference,
        batches: Array<IFileSplitMultipleBatch>,
        rotations: Array<IFileRotation>,
        reauthOnFailure: boolean
        ): Observable<any> {

        const options = new RequestOptions({
            headers: new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Token': this.uniFilesToken,
                'Key': this.activeCompany.Key
            })
        });

        const splitData = {
            Batches: batches,
            Rotations: rotations
        };

        return this.http.post(
            this.uniFilesBaseUrl + `/api/file/split-multiple?id=${fileStorageReference}`,
            JSON.stringify(splitData),
            options
        ).catch(err => {
            if (err.status === 401 && reauthOnFailure) {
                return Observable.fromPromise(this.authService.authenticateUniFiles())
                    .switchMap(() => this.splitFileMultiple(fileStorageReference, batches, rotations, false));
            } else {
                return Observable.throw(err);
            }
        }).map(response => response.json());
    }

    public splitFile(fileStorageReference, fromPage, reauthOnFailure: boolean): Promise<any> {
        const options = new RequestOptions({
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
                        if (err.status === 401 && reauthOnFailure) {
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

export interface IFileSplitMultipleBatch {
    Pages: Array<number>;
}

export interface IFileRotation {
    Page: number;
    Rotation: number;
}
