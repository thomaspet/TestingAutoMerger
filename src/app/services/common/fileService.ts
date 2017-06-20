import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {File} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import 'rxjs/add/operator/switchMap';

@Injectable()
export class FileService extends BizHttp<File> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = File.RelativeUrl;
        this.entityType = File.EntityType;
        this.DefaultOrderBy = null;
    }

    public downloadFile(fileID: number, contentType: string) {
        return this.http
            .asGET()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${fileID}?action=download`)
            .send()
            .switchMap((urlResponse: Response) => {
                let url = urlResponse['_body'].replace(/\"/g, '');
                return this.http.http.get(url);
            })
            .map(res => new Blob([res['_body']], { type: contentType }));
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

    public create(file: File) {
        return this.http
            .asPOST()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files`)
            .withBody(file)
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
