import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Http} from '@angular/http';
import {File} from '../../../unientities';
import {UniHttp} from '../../../../framework/core/http/http';
import {AppConfig} from '../../../AppConfig';
import {ErrorService, FileService, UniFilesService} from '../../../services/services';
import {AuthService} from '../../../authService';


export interface IUploadConfig {
    isDisabled?: boolean;
    disableMessage?: string;
}

@Component({
    selector: 'uni-upload-file-button',
    template: `
        <label
            class="uni-upload-file-button"
            [attr.aria-disabled]="uploadConfig?.isDisabled || uploading"
            [attr.aria-busy]="uploading">
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

    private didTryReAuthenticate: boolean = false;

    private baseUrl: string = AppConfig.BASE_URL_FILES;
    private token: any;
    private activeCompany: any;
    private uploading: boolean;

    constructor(
        private ngHttp: Http,
        private http: UniHttp,
        private errorService: ErrorService,
        private authService: AuthService,
        private uniFilesService: UniFilesService,
        private fileService: FileService
    ) {
        authService.authentication$.subscribe((authDetails) => {
            this.activeCompany = authDetails.activeCompany;
        });

        authService.filesToken$.subscribe(token => this.token = token);
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
        data.append('Key', this.activeCompany.Key);
        data.append('Caption', ''); // where should we get this from the user?
        data.append('File', file); // TODO: check if this can be .toString()

        this.ngHttp.post(this.baseUrl + '/api/file', data)
            .map(res => res.json())
            .subscribe((res) => {
                // files are uploaded to unifiles, and will get an externalid that
                // references the file in UE - get the UE file and add that to the
                // collection
                this.fileService.Get(res.ExternalId)
                    .subscribe(newFile => {
                        this.uploading = false;
                        this.fileUploaded.emit(newFile);
                    }, err => this.errorService.handle(err));
            }, err => {
                // if an error occurs, try to reauthenticate to unifiles - typically
                // this happens if unifiles is deployed while the user is logged in
                if (!this.didTryReAuthenticate) {
                    // run reauthentication and try to upload the file once more
                    // so the user doesnt have to
                    this.reauthenticate(() => {
                        this.uploadFile(file);
                    });
                } else {
                    this.errorService.handle(err);
                }
            });
    }

    public reauthenticate(runAfterReauth) {
        if (!this.didTryReAuthenticate) {
            // set flag to avoid "authentication loop" if the new authentication
            // also throws an error
            this.didTryReAuthenticate = true;

            this.uniFilesService.checkAuthentication()
                .then(res => {
                    // authentication is ok - something else caused the problem
                }).catch(err => {
                    // authentication failed, try to reauthenticated
                    this.authService.authenticateUniFiles()
                        .then(res => {
                            if (runAfterReauth) {
                                runAfterReauth();
                            }
                        }).catch((errAuth) => {
                            this.errorService.handle(err);
                        });
                });
        }
    }
}
