import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Http} from '@angular/http';
import {File} from '../../../unientities';
import {UniHttp} from '../../../../framework/core/http/http';
import {AppConfig} from '../../../appConfig';
import {ErrorService} from '../../../services/services';
import {AuthService} from '../../../../framework/core/authService';


export interface IUploadConfig {
    isDisabled?: boolean;
    disableMessage?: string;
}

@Component({
    selector: 'uni-upload-file-button',
    template: `
        <label class="uni-upload-file-button" [attr.aria-disabled]="uploadConfig?.isDisabled || uploading" [attr.aria-busy]="uploading">
            <span *ngIf="!uploading">{{buttonText}}</span>
            <input type="file"
                (change)="uploadFileChange($event)"
                [attr.aria-disabled]="uploadConfig?.isDisabled"
                [disabled]="uploadConfig?.isDisabled"
            />
        </label>
    `,
})
export class UniUploadFileButton {
    @Input()
    public buttonText: string = 'Last opp';

    @Output()
    public fileUploaded: EventEmitter<File> = new EventEmitter<File>();

    @Input()
    public uploadConfig: IUploadConfig;

    private baseUrl: string = AppConfig.BASE_URL_FILES;
    private token: any;
    private activeCompany: any;
    private uploading: boolean;

    constructor(
        private ngHttp: Http,
        private http: UniHttp,
        private errorService: ErrorService,
        authService: AuthService) {
            // Subscribe to authentication/activeCompany changes
            authService.authentication$.subscribe((authDetails) => {
                this.token = authDetails.token;
                this.activeCompany = authDetails.activeCompany;
            } /* don't need error handling */);
        }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;

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
        data.append('Caption', ''); // where should we get this from the user?
        data.append('File', file);

        this.ngHttp.post(this.baseUrl + '/api/file', data)
            .map(res => res.json())
            .subscribe((res) => {
                this.uploading = null;
                this.fileUploaded.emit(res);
            }, err => this.errorService.handle(err));
    }
}
