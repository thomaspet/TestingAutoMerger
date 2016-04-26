import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {FileUploadService} from './FileUploadService';

@Component({
    selector: 'uni-document-uploader',
    providers: [FileUploadService],
    template: `
        <input type="file" (change)="fileChangeEvent($event)" (mouseout)="checkEmptyFiles($event)"/>
        <button (click)="uploadFile()" [disabled]="!canUpload()">Upload</button>
    `
})
export class UniDocumentUploader {

    @Input()
    public uploader: FileUploadService<any>;

    @Input()
    public entity: any;

    @Output()
    public onFileUploaded: EventEmitter<any> = new EventEmitter<any>(true);

    private files: FileList;

    constructor() { }

    public uploadFile() {
        if (!this.files || this.files.length === 0) {
            return;
        }
        var file = this.files[0]; // TODO: could we update more than one file at once???
        this.uploader.upload(this.entity.ID, file)
            .then(this.manageResponse.bind(this));
    }

    public manageResponse(response) {
        this.onFileUploaded.emit(this.uploader.Slot);
    }

    public fileChangeEvent(event: any) {
        var files = event.srcElement.files;
        if (!files || !files.length) {
            this.files = undefined;
            return;
        }
        this.files = files;
    }

    public checkEmptyFiles(event: any) {
        if (event.target.files.length === 0) {
            this.files = undefined;
        }
    }

    public canUpload() {
        return (this.files !== undefined && this.files.length > 0);
    }
}