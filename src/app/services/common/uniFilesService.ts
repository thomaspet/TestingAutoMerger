import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {environment} from 'src/environments/environment';
import {AuthService} from '../../authService';
import {Observable, throwError, from} from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class UniFilesService {
    private uniFilesBaseUrl: string = environment.BASE_URL_FILES;
    private uniFilesToken: string;
    private uniEconomyToken: string;
    private activeCompany: any;

    constructor(private http: Http, private authService: AuthService) {
        authService.authentication$.subscribe((authDetails) => {
            this.activeCompany = authDetails.activeCompany;
            this.uniEconomyToken = authDetails.token;
        });

        authService.filesToken$.subscribe(token => {
            this.uniFilesToken = token;
        });
    }

    getEhfData(storageReference: string) {
        const url = `${this.uniFilesBaseUrl}/api/download?format=json`
            + `&id=${storageReference}`
            + `&key=${this.activeCompany.Key}`
            + `&token=${this.uniEconomyToken}`;

        return this.http.get(url).map(res => res.json());
    }

    public syncUniEconomyCompanySettings() {
        const options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniEconomyToken,
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
                'Token': this.uniEconomyToken,
                'Key': this.activeCompany.Key
            })
        });

        return this.http.get(this.uniFilesBaseUrl + '/api/file/force-full-load/' + id, options);
    }

    public getFileSplitList(id: string, reauthOnFailure: boolean = true): Observable<any> {
        const options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniEconomyToken,
                'Key': this.activeCompany.Key
            })
        });

        return this.http.get(this.uniFilesBaseUrl + '/api/file/get-page-split-info/' + id, options)
            .map(res => res.json());
    }

    public rotate(id: string, page: number, rotateClockwise: boolean): Observable<any> {
        const options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniEconomyToken,
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
                'Token': this.uniEconomyToken,
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
                'Token': this.uniEconomyToken,
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
                'Token': this.uniEconomyToken,
                'Key': this.activeCompany.Key
            })
        });

        this.http.post(
                this.uniFilesBaseUrl + '/api/ocr/train-engine',
                ocrInterpretation,
                options)
            .subscribe(res => {
                // result is not used
            }, err => {
                // ignore errors on this api call
            });
    }

    public splitFileMultiple(
        fileStorageReference,
        batches: Array<IFileSplitMultipleBatch>,
        rotations: Array<IFileRotation>,
        hasTriedReAuth?: boolean
    ): Observable<any> {
        const options = new RequestOptions({
            headers: new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Token': this.uniEconomyToken,
                'Key': this.activeCompany.Key
            })
        });

        return this.http.post(
            this.uniFilesBaseUrl + `/api/file/split-multiple?id=${fileStorageReference}`,
            JSON.stringify({Batches: batches, Rotations: rotations}),
            options
        ).map(res => res.json && res.json());
    }

    public splitFile(fileStorageReference, fromPage, hasTriedReAuth?: boolean): Observable<any> {
        const options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                'Token': this.uniEconomyToken,
                'Key': this.activeCompany.Key
            })
        });

        return this.http.post(
            this.uniFilesBaseUrl + `/api/file/split?id=${fileStorageReference}&frompage=${fromPage}`,
            null, options
        ).map(res => res.json && res.json());
    }
}

export interface IFileSplitMultipleBatch {
    Pages: Array<number>;
}

export interface IFileRotation {
    Page: number;
    Rotation: number;
}
