import {Injectable} from 'angular2/core';
import {UniHttp} from '../core/http/http';
import {AuthService} from '../core/authService';
import {File as UniFile} from '../../app/unientities';
export interface IFileMetaData {
    Name: string;
    Description: string;
    // Space: string;
    // Pages: number;
}

@Injectable()
export class FileUploadService<T> {

    protected file: File;
    protected blob: string;
    protected entityType: string;
    protected entityID: number;
    protected _statusText: string;
    protected slot: any;

    public set statusText(statusText: string) {
        this._statusText = statusText;
    }
    public get statusText(): string {
        return this._statusText;
    }

    public get Slot(): any {
        return this.slot;
    }

    constructor(protected $http: UniHttp, protected authService: AuthService) {

    }

    // TODO: unientities should provide entity name so we can config http in contructor
    public GetAll(entityId: number) {
        return this.$http
            .asGET()
            .withDefaultHeaders()
            .withEndPoint(`files/${this.entityType}/${entityId}`)
            .send();
    }

    public remove(entityId: number, slotId: number) {
        return this.$http
            .asDELETE()
            .withDefaultHeaders()
            .withEndPoint(`files/${this.entityType}/${entityId}/${slotId}`)
            .send();
    }

    public download(entityId: number, slotId: number) {
        return this.$http
            .asGET()
            .withDefaultHeaders()
            .withEndPoint(`files/${this.entityType}/${entityId}/${slotId}?action=download`)
            .send();
    }

    public upload(entityID: number, file: File) {
        this.entityID = entityID;
        this.entityType = this.entityType;
        this.file = file;

        var self = this;

        return self.OpenSlot()
            .then(self.uploadFile.bind(self))
            .then(self.finalizeFile.bind(self))
            .then((response) => {
                self.statusText = 'file uploaded';
                setTimeout((() => {
                    self.statusText = '';
                }).bind(self), 1000);
            })
            .catch(error => {
                self.statusText = error;
            });
    }

    private OpenSlot() {
        var metadata: UniFile = new UniFile();
        metadata.Name = this.file.name;
        metadata.Description = this.file.name;

        this.statusText = 'opening slot...';
        return this.$http
            .asPOST()
            .withEndPoint(`files/${this.entityType}/${this.entityID}`)
            .withBody(metadata)
            .send()
            .toPromise()
            .catch(error => this.statusText = error);
    }


    private uploadFile(metadata: any) {
        var self = this;

        this.slot = metadata;
        this.statusText = 'uploading file...';

        var fr: FileReader = new FileReader();
        fr.onloadend = (event) => {
            return new Promise((resolve, reject) => {
                var r: XMLHttpRequest = new XMLHttpRequest();
                r.open('PUT', metadata.UploadSlot, true);
                r.setRequestHeader('contentType', 'multipart/form-data');
                r.setRequestHeader('x-ms-blob-type', 'BlockBlob');
                r.setRequestHeader('Accept', '*/*');
                r.setRequestHeader('ContentLength', self.file.size.toString());
                r.onreadystatechange = () => {
                    if (r.readyState === 4 || r.status === 201) {
                        resolve(metadata);
                    }
                    return;
                };
                r.onerror = (error) => reject(error);
                var target: any = event.target;
                r.send(target.result);
            });
        };
        fr.readAsArrayBuffer(this.file);
    }

    private finalizeFile(response) {
        this.statusText = 'Finalizing file...';
        return this.$http
            .withDefaultHeaders()
            .asPOST()
            .withEndPoint(`files/${this.entityType}/${this.entityID}/${this.slot.ID}?action=finalize`)
            .send()
            .toPromise()
            .catch(error => this.statusText = error);
    }
}
