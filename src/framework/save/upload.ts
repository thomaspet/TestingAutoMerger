import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Http} from '@angular/http';
import {File} from '../../app/unientities';
import {UniHttp} from '../core/http/http';
import {environment} from 'src/environments/environment';
import {ErrorService, FileService, UniFilesService} from '../../app/services/services';
import {AuthService} from '../../app/authService';


export interface IUploadConfig {
    isDisabled?: boolean;
    disableMessage?: string;
}

@Component({
    selector: 'uni-upload-file-save',
    template: `
        <label>
            <span>{{ textOnButton }}</span>
            <input type="file"
                (change)="uploadFileChange($event)"
                [attr.aria-disabled]="uploadConfig?.isDisabled"
                [disabled]="uploadConfig?.isDisabled"
            />
        </label>
    `,
})
export class UniUploadFileSaveAction {
    @Input()
    public buttonText: string;

    @Output()
    public fileUploaded: EventEmitter<File> = new EventEmitter<File>();

    @Input()
    public uploadConfig: IUploadConfig;

    private didTryReAuthenticate: boolean = false;

    private baseUrl: string = environment.BASE_URL_FILES;
    private token: any;
    private activeCompany: any;
    private uploading: boolean;
    public textOnButton: string = 'Last opp';

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

    public ngOnInit() {
        this.textOnButton = this.buttonText;
    }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;

        if (source.files && source.files.length) {
            this.uploading = true;
            this.textOnButton = 'Laster opp...';
            const newFile = source.files[0];
            source.value = '';
            this.uploadFile(newFile);
        }
    }

    private uploadFile(file: File) {
        let data = new FormData();
        data.append('Token', this.token);
        data.append('Key', this.activeCompany.Key);
        data.append('Caption', ''); // Where should we get this from the user?
        data.append('File', <any>file);

        this.ngHttp.post(this.baseUrl + '/api/file', data)
            .map(res => res.json())
            .subscribe((res) => {
                // Files are uploaded to unifiles, and will get an externalid that
                // references the file in UE - get the UE file and add that to the
                // collection
                this.uploading = false;
                this.textOnButton = this.buttonText;

                this.fileService.Get(res.ExternalId)
                    .subscribe(newFile => {
                        this.fileUploaded.emit(newFile);
                    }, err => this.errorService.handle(err));
            }, err => {
                // If an error occurs, try to reauthenticate to unifiles - typically
                // this happens if unifiles is deployed while the user is logged in
                if (!this.didTryReAuthenticate) {
                    // Run reauthentication and try to upload the file once more
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
            // Set flag to avoid "authentication loop" if the new authentication
            // also throws an error
            this.didTryReAuthenticate = true;

            this.uniFilesService.checkAuthentication()
                .then(res => {
                    // Authentication is ok - something else caused the problem
                }).catch(err => {
                    // Authentication failed, try to reauthenticated
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
