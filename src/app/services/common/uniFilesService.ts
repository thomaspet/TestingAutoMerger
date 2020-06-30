import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {AuthService} from '../../authService';
import {Observable} from 'rxjs';

@Injectable()
export class UniFilesService {
    private uniFilesBaseUrl: string = environment.BASE_URL_FILES;
    private activeCompany: any;

    constructor(private http: HttpClient, private authService: AuthService) {
        this.authService.authentication$.subscribe((authDetails) => {
            if (authDetails) {
                this.activeCompany = authDetails.activeCompany;
            }
        });
    }

    upload(file, entityType?: string, entityID?: number) {
        const data = new FormData();
        data.append('Token', this.authService.jwt);
        data.append('Key', this.authService.getCompanyKey());
        data.append('CacheOnUpload', 'true');
        data.append('File', file);

        if (entityType) {
            data.append('EntityType', entityType);
        }

        if (entityID) {
            data.append('EntityID', entityID.toString());
        }

        return this.http.post<any>(this.uniFilesBaseUrl + '/api/file', data, {
            observe: 'body'
        });
    }

    getEhfData(storageReference: string) {
        const url = `${this.uniFilesBaseUrl}/api/download?format=json`
            + `&id=${storageReference}`
            + `&key=${this.activeCompany.Key}`
            + `&token=${this.authService.jwt}`;

        return this.http.get(url);
    }

    public syncUniEconomyCompanySettings() {
        this.http.get(this.uniFilesBaseUrl + '/api/client/sync-ue-client-data', {
            headers: {
                'Accept': 'application/json',
                'Token': this.authService.jwt,
                'Key': this.activeCompany.Key
            }
        }).subscribe(
            () => {
                console.log('settings synced to unifiles');
            }, err => {
                // ignore error here - usually it wont matter much for the user anyway
                console.log('error syncing settings to uni files', err);
            }
        );
    }

    public forceFullLoad(id: string): Observable<any> {
        return this.http.get(this.uniFilesBaseUrl + '/api/file/force-full-load/' + id, {
            headers: {
                'Key': this.activeCompany.Key
            }
        });
    }

    public getFileSplitList(id: string): Observable<any> {
        return this.http.get(this.uniFilesBaseUrl + '/api/file/get-page-split-info/' + id, {
            observe: 'body',
            headers: {
                'Key': this.activeCompany.Key
            }
        });
    }

    public rotate(id: string, page: number, rotateClockwise: boolean): Observable<any> {
        return this.http.get(this.uniFilesBaseUrl + `/api/file/rotate-page/${id}/${page}/${rotateClockwise}`, {
            headers: {
                'Key': this.activeCompany.Key
            }
        });
    }

    public getFileProcessingStatus(id: string): Observable<any> {
        return this.http.get(this.uniFilesBaseUrl + '/api/file/filestatus/' + id, {
            observe: 'body',
            headers: {
                'Key': this.activeCompany.Key
            }
        });
    }

    runOcr(id: string): Observable<any> {
        return this.http.get(this.uniFilesBaseUrl + '/api/ocr/analyze?id=' + id, {
            observe: 'body',
            headers: {
                'Key': this.activeCompany.Key
            }
        });
    }

    public getOcrStatistics(): Observable<any> {
        return this.http.get(this.uniFilesBaseUrl + '/api/client/get-ocr-stats', {
            observe: 'body',
            headers: {
                'Key': this.activeCompany.Key
            }
        });
    }

    public trainOcrEngine(body) {
        this.http.post(this.uniFilesBaseUrl + '/api/ocr/train-engine', body, {
            headers: {
                'Key': this.activeCompany.Key
            }
        }).subscribe(
            () => {},
            () => {}
        );
    }

    public splitFileMultiple(
        fileStorageReference,
        batches: IFileSplitMultipleBatch[],
        rotations: IFileRotation[]
    ): Observable<any> {
        const url = this.uniFilesBaseUrl + `/api/file/split-multiple?id=${fileStorageReference}`;
        const body = JSON.stringify({Batches: batches, Rotations: rotations});
        return this.http.post(url, body, {
            observe: 'body',
            headers: {
                'Content-Type': 'application/json',
                'Key': this.activeCompany.Key
            }
        });
    }

    public splitFile(fileStorageReference, fromPage): Observable<any> {
        const url = this.uniFilesBaseUrl + `/api/file/split?id=${fileStorageReference}&frompage=${fromPage}`;
        return this.http.post(url, null, {
            observe: 'body',
            headers: {
                'Key': this.activeCompany.Key
            }
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
