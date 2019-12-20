import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HttpResponse} from '@angular/common/http';
import {BizHttp, IHttpCacheStore} from '../../../framework/core/http/BizHttp';
import {File} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import 'rxjs/add/operator/switchMap';
import {Observable, of} from 'rxjs';
import {take, tap, switchMap, map} from 'rxjs/operators';
import {ErrorService} from './errorService';
import {saveAs} from 'file-saver';

@Injectable()
export class FileService extends BizHttp<File> {
    private imageCache: IHttpCacheStore<Blob> = {};

    constructor(
        private httpClient: HttpClient,
        private errorService: ErrorService,
        http: UniHttp
    ) {
        super(http);
        super.disableCache();

        this.relativeURL = 'files';
        this.entityType = File.EntityType;
        this.DefaultOrderBy = null;
    }

    public getFilesOn(entity: string, id: number): Observable<File[]> {
        return super.GetAll(`filter=EntityLinks.EntityType eq '${entity}' and EntityLinks.EntityID eq ${id}`, ['EntityLinks']);
    }

    getImageBlob(imageUrl: string) {
        const hash = this.hashFnv32a(imageUrl);

        const cacheEntry = this.imageCache[hash];
        if (cacheEntry && (!cacheEntry.timeout || performance.now() < cacheEntry.timeout)) {
            return cacheEntry.data.pipe(take(1));
        } else {
            delete this.imageCache[hash];
        }

        return this.httpClient.get(imageUrl, { responseType: 'blob' }).pipe(
            tap(res => {
                this.imageCache[hash] = {
                    timeout: performance.now() + 60000,
                    data: of(res)
                };
            })
        );
    }

    getDownloadUrl(fileID: number) {
        return this.http
            .asGET()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${fileID}?action=download`)
            .send()
            .map(response => response.body);
    }

    downloadFile(file: File) {
        this.getDownloadUrl(file.ID).pipe(
            switchMap(url => this.httpClient.get(url, { responseType: 'blob' }))
        ).subscribe(
            (blob: Blob) => {
                saveAs(blob, file.Name);
            },
            err => this.errorService.handle(err)
        );
    }

    downloadXml(fileID: number, type = 'application/xml') {
        return this.getDownloadUrl(fileID).pipe(
            switchMap(url => {
                url = url.replace(/\"/g, '');
                return this.httpClient.get(url, { responseType: 'text' });
            }),
            map(res => new Blob([res], { type: type }))
        );

        // return this.http
        //     .asGET()
        //     .withDefaultHeaders()
        //     .usingBusinessDomain()
        //     .withEndPoint(`files/${fileID}?action=download`)
        //     .send()
        //     .switchMap((urlResponse: HttpResponse<any>) => {
        //         const url = urlResponse.body.replace(/\"/g, '');
        //         return this.http.http.get(url, {responseType: 'text'});
        //     })
        //     .map(res => new Blob([res], { type: type }));
    }

    public setIsAttachment(entityType: string, entityID: number, fileID: number, isAttachment: boolean) {
        return this.http
            .asPUT()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${fileID}?action=set-is-attachment`
                + `&entityType=${entityType}`
                + `&entityID=${entityID}`
                + `&isAttachment=${isAttachment}`
            )
            .send()
            .map(response => response.body);
    }

    public linkFile(entityType: string, entityID: number, fileID: number) {
        return this.http
            .asPOST()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${fileID}?action=link&entityType=${entityType}&entityID=${entityID}`)
            .send()
            .map(response => response.body);
    }

    unlinkFile(entityType: string, entityID: number, fileID: number) {
        return this.http.asPOST()
            .usingBusinessDomain()
            .withEndPoint(`files/${fileID}?action=unlink&entitytype=${entityType}&entityid=${entityID}`)
            .send();
    }

    public getLinkedEntityID(fileID: number, entityType?: string) {
        if (fileID) {
            let filter = `deleted eq 0 and fileid eq ${fileID}`;
            if (entityType) {
                filter +=  ` and entitytype eq '${entityType}'`;
            }

            return this.getStatistics(
                `model=fileentitylink&select=entityid as entityID,entityType as entityType&filter=${filter}&orderby=entityid desc`
            ).map(response => response.Data);
        } else {
            return Observable.of([]);
        }
    }

    public splitFile(oldFileID: number, newFileID1: number, newFileID2: number) {
        return this.http
            .asPOST()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files?action=split-file&oldFileID=${oldFileID}&newFileID1=${newFileID1}&newFileID2=${newFileID2}`)
            .send()
            .map(response => response.body);
    }

    public splitFileMultiple(oldFileID: number, newFileIds: Array<number>) {
        let newFileIdsString = newFileIds.join(',');

        return this.http
            .asPOST()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files?action=split-file-multiple&oldFileID=${oldFileID}&newFileIds=${newFileIdsString}`)
            .send()
            .map(response => response.body);
    }

    public delete(fileId: number) {
        return this.http
            .asDELETE()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${fileId}`)
            .send();
    }

    public deleteOnEntity(entityType: string, entityID: number, fileID: number) {
        return this.http
            .asDELETE()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${entityType}/${entityID}/${fileID}`)
            .send();
    }

    public tag(id: number, tag: string, status: number = 0) {
        return this.http
            .asPOST()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`filetags`)
            .withBody({ FileID: id, TagName: tag, Status: status })
            .send()
            .map(response => response.body);
    }

    public getStatistics(query: string) {
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint('?' + query).send()
        .map(response => response.body);

    }
}
