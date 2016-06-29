import {Injectable, Inject} from '@angular/core';
import {FileUploadService} from '../documents/index';
import {UniHttp} from '../core/http/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ImageUploader extends FileUploadService<any> {
    
    constructor(protected http: UniHttp) {
        super(http);
    }

    public uploadImage(entityType: any, entityID: number, file: File): Promise<any> {
        this.entityType = entityType;
        return this.upload(entityID, file);
    }
}
