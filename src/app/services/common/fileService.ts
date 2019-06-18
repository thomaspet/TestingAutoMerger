import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {File} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import 'rxjs/add/operator/switchMap';
import {Observable} from 'rxjs';

@Injectable()
export class FileService extends BizHttp<File> {

    constructor(http: UniHttp) {
        super(http);
        super.disableCache();

        this.relativeURL = 'files';
        this.entityType = File.EntityType;
        this.DefaultOrderBy = null;
    }

    public getFilesOn(entity: string, id: number): Observable<File[]> {
        return super.GetAll(`filter=EntityLinks.EntityType eq '${entity}' and EntityLinks.EntityID eq ${id}`, ['EntityLinks']);
    }

    public printFile(fileID: number) {
        return this.http
            .asGET()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${fileID}?action=download`)
            .send()
            .map((urlResponse: Response) => urlResponse);
    }

    public getDownloadUrl(fileID: number) {
        return this.http
            .asGET()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${fileID}?action=download`)
            .send()
            .map(response => response.json());
    }

    public downloadFile(fileID: number, contentType: string,asAttachment:boolean=true) {
        return this.http
            .asGET()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${fileID}?action=download`)
            .send()
            .switchMap((urlResponse: Response) => {
                const url = urlResponse['_body'].replace(/\"/g, '');
                return this.http.http.get(url);
            })
            .map(res => new Blob([res['_body']], { type: contentType }));
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
            .map(response => response.json());
    }

    public linkFile(entityType: string, entityID: number, fileID: number) {
        return this.http
            .asPOST()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${fileID}?action=link&entityType=${entityType}&entityID=${entityID}`)
            .send()
            .map(response => response.json());
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
            .map(response => response.json());
    }

    public splitFileMultiple(oldFileID: number, newFileIds: Array<number>) {
        let newFileIdsString = newFileIds.join(',');

        return this.http
            .asPOST()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files?action=split-file-multiple&oldFileID=${oldFileID}&newFileIds=${newFileIdsString}`)
            .send()
            .map(response => response.json());
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
            .map(response => response.json());
    }

    public getStatistics(query: string) {
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint('?' + query).send()
        .map(response => response.json());

    }
}
