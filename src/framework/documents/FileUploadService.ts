import {Injectable} from '@angular/core';
import {UniHttp} from '../core/http/http';
import {File as UniFile} from '../../app/unientities';
declare var _;

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
    protected _statusText: string = '';
    protected slot: any;
    protected slots: any[];

    public set statusText(statusText: string) {
        this._statusText = statusText;
    }
    public get statusText(): string {
        return this._statusText;
    }

    public get Slot(): any {
        return this.slot;
    }

    public get Slots(): any {
        return this.slots;
    }

    constructor(protected $http: UniHttp) {

    }

    public getSlots(entityId: number) {
        var self = this;
        var $getSlots = this.$http
            .asGET()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${this.entityType}/${entityId}`)
            .send()
            .map(response => response.json())
            .toPromise()
            .then(response => {
                self.slots = response;
                return response;
            });
        return $getSlots;
    }

    public remove(entityId: number, slot: any) {
        var self = this;
        var $remove = this.$http
            .asDELETE()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${this.entityType}/${entityId}/${slot.ID}`)
            .send()
            .map(response => response.json())
            .toPromise()
            .then((response) => {
                return self.removeSlot(slot);
            });
        return $remove;
    }

    public download(entityId: number, slotId: number) {
        return this.$http
            .asGET()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`files/${this.entityType}/${entityId}/${slotId}?action=download`)
            .send()
            .map(response => response.json())
            .toPromise();
    }

    public upload(entityID: number, file: File) {
        this.entityID = entityID;
        this.entityType = this.entityType;
        this.file = file;

        var self = this;

        self.statusText = '';
        return self.openSlot()
            .then((response) => {
                self.slot = response;
                self.statusText = 'uploading file...';
                return response;
            })
            .then(self.uploadFile.bind(self))
            .then((response) => {
                self.statusText = 'finalizing file...';
                return response;
            })
            .then(self.finalizeFile.bind(self))
            .then((response) => {
                self.statusText = 'file uploaded';
                self.addSlot(self.slot);
                self.statusText = '';
            })
            .catch(error => {
                self.statusText = error;
            });
    }

    public addSlot(slot: any) {
        this.slots = [].concat(this.slots, slot);
    }

    public removeSlot(slot: any) {
        var index = this.Slots.indexOf(slot);
        var clone = _.clone(this.Slots[index]);
        this.slots = this.Slots.slice(0, index).concat(this.Slots.slice(index + 1));
        return clone;
    }

    private openSlot() {
        var metadata: UniFile = new UniFile();
        metadata.Name = this.file.name;
        metadata.Description = this.file.name;

        this.statusText = 'opening slot...';
        return this.$http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`files/${this.entityType}/${this.entityID}`)
            .withBody(metadata)
            .send()
            .map(response => response.json())
            .toPromise()
            .catch(error => this.statusText = error);
    }


    private uploadFile(metadata: any) {
        var self = this;
        return new Promise((resolve, reject) => {
            var fr: FileReader = new FileReader();
            fr.readAsArrayBuffer(self.file);
            fr.onloadend = (event) => {
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
            };
        });
    }

    private finalizeFile(response) {
        return this.$http
            .withDefaultHeaders()
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`files/${this.entityType}/${this.entityID}/${this.slot.ID}?action=finalize`)
            .send()
            .map(response => response.json())
            .toPromise()
            .catch(error => this.statusText = error);
    }
}
