import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {FileUploadService} from './FileUploadService';

declare var jQuery;

@Component({
    selector: 'uni-document-uploader',
    template: `
        <label class="upload" [ngClass]="{'-has-files': files}"> 
        
            <span *ngIf="!files || !files.length">
                <strong>Choose file</strong> or drag to upload
            </span>
            
            <span *ngIf="files && files.length">
                <strong>{{files.length}}</strong> file<span *ngIf="files.length > 1">s</span> ready to upload
            </span>
            
            <input type="file" (change)="fileChangeEvent($event)" (mouseout)="checkEmptyFiles($event)"/>            
        </label>
        <button (click)="uploadFile()" [disabled]="!canUpload()">Upload</button>
    `
})
export class UniDocumentUploader {

    @Input()
    public service: FileUploadService<any>;

    @Input()
    public entity: any;

    @Output()
    public onFileUploaded: EventEmitter<any> = new EventEmitter<any>(true);

    private files: FileList;
    private elem: any;

    constructor(public element: ElementRef) {
        this.elem = element;
    }

    public ngAfterViewInit() {
        // Using jQuery here, so we don't have to split the event listeners
        let $el = jQuery(this.elem.nativeElement.querySelector('label'));
        $el.on('drag dragstart dragend dragover dragenter dragleave drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        $el.on('dragover dragenter', (event) => {
            event.originalEvent.dataTransfer.dropEffect = 'copy';
            $el.addClass('-is-dragover');
        });
        $el.on('dragleave dragend drop', () => {
            $el.removeClass('-is-dragover');
        });
        $el.on('drop', (event) => {
            if (event.originalEvent.dataTransfer.files.length > 1) {
                // TODO: Change if we start allowing multiple uploads
                // We could also auto upload the files from here.
                return;
            }
            this.files = event.originalEvent.dataTransfer.files;
        });
    }

    public uploadFile() {
        if (!this.files || this.files.length === 0) {
            return;
        }
        var file = this.files[0]; // TODO: could we update more than one file at once???
        this.service.upload(this.entity.ID, file)
            .then(this.manageResponse.bind(this));
    }

    public manageResponse(response) {
        this.onFileUploaded.emit(this.service.Slot);
        this.cleanInput();
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
            this.cleanInput();
        }
    }

    public canUpload() {
        return (this.files !== undefined && this.files.length > 0);
    }

    public clearFiles() {
        this.files = undefined;
    }

    private cleanInput() {
        this.files = undefined;
        let $el = jQuery(this.elem.nativeElement.querySelector('input[type=file]'));
        $el.val('');
    }

}