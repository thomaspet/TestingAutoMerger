import {Component, Input, SimpleChanges, ViewChild, Output, EventEmitter} from '@angular/core';
import {Http} from '@angular/http';
import {File} from '../../../unientities';
import {UniHttp} from '../../../../framework/core/http/http';
import {AuthService} from '../../../../framework/core/authService';
import {FileService, ErrorService} from '../../../services/services';
import {ImageUploader} from '../../../../framework/uniImage/imageUploader';
import {AppConfig} from '../../../AppConfig';
import {ImageModal} from '../modals/ImageModal';
import {UniImageSize} from '../../../../framework/uniImage/uniImage';
import {saveAs} from 'file-saver';

export interface IUploadConfig {
    isDisabled?: boolean;
    disableMessage?: string;
}

@Component({
    selector: 'uni-attachments',
    template: `
        <label *ngIf="!hideLabel">{{headerText}}</label>
        <article>
             <section class="file-name-list" *ngIf="showFileList">
                <ul>
                    <li *ngFor="let file of files">
                        <a (click)="attachmentClicked(file)">{{file?.Name}}</a>
                        <button class="removeDocumentButton" (click)="removeDocument(file?.ID)"></button>
                    </li>
                </ul>
            </section>
            <section class="upload" *ngIf="!readonly && !uploadConfig?.isDisabled" [attr.aria-busy]="uploading">
                <label class="uni-image-upload"
                       [attr.aria-disabled]="uploadConfig?.isDisabled || uploading"
                       (drop)="onDrop($event, dropData)">
                    <input type="file"
                        (change)="uploadFileChange($event)"
                        [attr.aria-disabled]="uploadConfig?.isDisabled"
                        [disabled]="uploadConfig?.isDisabled">
                </label>
            </section>
        </article>
        <image-modal></image-modal>
    `,
})
export class UniAttachments {
    @ViewChild(ImageModal) public imageModal: ImageModal;

    @Input()
    public entity: string;

    @Input()
    public entityID: number;

    @Input()
    public size: UniImageSize;

    @Input()
    public readonly: boolean;

    @Input()
    public uploadConfig: IUploadConfig;

    @Input()
    public showFileList: boolean = true;

    @Input()
    public uploadWithoutEntity: boolean = false;

    @Input()
    public downloadAsAttachment: boolean = false;

    @Input()
    public headerText: string = 'Vedlegg';

    @Input()
    public hideLabel: boolean;

    @Output()
    public fileUploaded: EventEmitter<File> = new EventEmitter<File>();

    private baseUrl: string = AppConfig.BASE_URL_FILES;

    private token: any;
    private activeCompany: any;

    private uploading: boolean;

    private files: File[] = [];

    constructor(
        private ngHttp: Http,
        private http: UniHttp,
        private imageUploader: ImageUploader,
        private errorService: ErrorService,
        private fileService: FileService,
        authService: AuthService) {
        // Subscribe to authentication/activeCompany changes
        authService.authentication$.subscribe((authDetails) => {
            this.token = authDetails.filesToken;
            this.activeCompany = authDetails.activeCompany;
        } /* don't need error handling */);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this.showFileList && (changes['entity'] || changes['entityID']) && this.entity && this.isDefined(this.entityID)) {
            this.getFiles();
        } else {
            this.files = [];
        }
    }

    private getFiles() {
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(`files/${this.entity}/${this.entityID}`)
            .send()
            .map(res => res.json())
            .subscribe(
                files => this.files = files,
                err => this.errorService.handle(err)
            );
    }

    private isDefined(value: any) {
        return (value !== undefined && value !== null);
    }

    public attachmentClicked(attachment: File) {
        if (!this.downloadAsAttachment) {
            this.imageModal.openReadOnly(this.entity, this.entityID, attachment.ID);
        } else {
            this.fileService
                .downloadFile(attachment.ID, 'application/xml')
                    .subscribe((blob) => {
                        // download file so the user can open it
                        saveAs(blob, attachment.Name);
                    },
                    err => {
                        this.errorService.handle(err);
                    }
                );
        }
    }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;

        if (!this.uploadWithoutEntity && (!this.entity || !this.isDefined(this.entityID))) {
            throw new Error(`Tried to upload a feil with either entity (${this.entity})`
                 + ` or entityID (${this.entityID}) being null, and uploadWithoutEntity being false`);
        }

        if (source.files && source.files.length) {
            this.uploading = true;
            const newFile = source.files[0];
            source.value = '';
            this.uploadFile(newFile);
        }
    }

    private onDrop(event, dropData) {
        let transfer = this.getTransfer(event);
        if (!transfer) {
            return;
        }
        for (let i = 0; i < transfer.files.length; i++) {
            this.uploadFile(transfer.files[i]);
        }
    }

    protected getTransfer(event: any): any {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
    }

    private uploadFile(file: File) {

        let data = new FormData();
        data.append('Token', this.token);
        data.append('Key', this.activeCompany.Key);
        if (this.entity) {
            data.append('EntityType', this.entity);
        }
        if (this.entityID) {
            data.append('EntityID', this.entityID);
        }
        data.append('Caption', ''); // where should we get this from the user?
        data.append('File', file);

        this.ngHttp.post(this.baseUrl + '/api/file', data)
            .map(res => res.json())
            .subscribe((res) => {
                // files are uploaded to unifiles, and will get an externalid that
                // references the file in UE - get the UE file and add that to the
                // collection
                this.fileService.Get(res.ExternalId)
                    .subscribe(newFile => {
                        this.uploading = false;
                        this.fileUploaded.emit(res);
                        this.imageModal.refreshImages();
                        this.files.push(newFile);
                    }, err => this.errorService.handle(err));
            }, err => this.errorService.handle(err));
    }

    private removeDocument(fileID: number) {
        this.fileService.deleteOnEntity(this.entity, this.entityID, fileID)
            .subscribe(
                res => this.getFiles(),
                err => this.errorService.handle(err)
            );
    }
}
