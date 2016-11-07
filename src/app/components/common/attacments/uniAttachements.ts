import {Component, Input, SimpleChanges, ViewChild} from '@angular/core';
import {Http} from '@angular/http';
import {File} from '../../../unientities';
import {UniHttp} from '../../../../framework/core/http/http';
import {AuthService} from '../../../../framework/core/authService';
import {ImageUploader} from '../../../../framework/uniImage/imageUploader';
import {AppConfig} from '../../../AppConfig';
import {ImageModal} from '../modals/ImageModal';
import {UniImageSize} from '../../../../framework/uniImage/uniImage';

export interface IUploadConfig {
    isDisabled?: boolean;
    disableMessage?: string;
}

@Component({
    selector: 'uni-attachments',
    template: `
        <label>Vedlegg</label>
        <article>
             <section class="file-name-list">
                <ul>
                    <li *ngFor="let file of files">
                        <a (click)="attachmentClicked(file)">{{file.Name}}</a>
                    </li>
                </ul>
            </section>
            <section class="upload" *ngIf="!readonly && !uploadConfig?.isDisabled" [attr.aria-busy]="uploading">
                <label class="uni-image-upload"
                       [attr.aria-disabled]="uploadConfig?.isDisabled || uploading">
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

    private baseUrl: string = AppConfig.BASE_URL_FILES;

    private token: any;
    private activeCompany: any;

    private uploading: boolean;

    private files: File[] = [];

    constructor(private ngHttp: Http, private http: UniHttp, private imageUploader: ImageUploader, authService: AuthService) {
        // Subscribe to authentication/activeCompany changes
        authService.authentication$.subscribe((authDetails) => {
            this.token = authDetails.token;
            this.activeCompany = authDetails.activeCompany;
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if ((changes['entity'] || changes['entityID']) && this.entity && this.isDefined(this.entityID)) {
            this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint(`files/${this.entity}/${this.entityID}`)
                .send()
                .map(res => res.json())
                .subscribe(
                    files => this.files = files,
                    err => console.log('Got error when downloading attachements', err)
                );
        }
    }

    private isDefined(value: any) {
        return (value !== undefined && value !== null);
    }

    public attachmentClicked(attachment: File) {
        this.imageModal.openReadOnly(this.entity, this.entityID, attachment.ID);
    }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;

        if (!this.entity || !this.isDefined(this.entityID)) {
            throw new Error(`Tried to upload a picture with either entity (${this.entity})`
                + `or entityID (${this.entityID}) being null`);
        }

        if (source.files && source.files.length) {
            this.uploading = true;
            const newFile = source.files[0];
            source.value = '';
            this.uploadFile(newFile);
        }
    }

    private uploadFile(file: File) {
        let data = new FormData();
        data.append('Token', this.token);
        data.append('CompanyKey', this.activeCompany.Key);
        data.append('EntityType', this.entity);
        data.append('EntityID', this.entityID);
        data.append('Caption', ''); // where should we get this from the user?
        data.append('File', file);

        this.ngHttp.post(this.baseUrl + '/api/file', data)
            .map(res => res.json())
            .subscribe((res) => {
                this.uploading = false;
                this.files.push(res);
                this.imageModal.refreshImages();
            });
    }
}
