import {Component, Input, Output, EventEmitter} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {File} from '../../app/unientities';
import {environment} from 'src/environments/environment';
import {ErrorService, FileService} from '../../app/services/services';
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
    @Input() uploadConfig: IUploadConfig;
    @Input() buttonText: string;
    @Output() fileUploaded: EventEmitter<File> = new EventEmitter<File>();

    private baseUrl: string = environment.BASE_URL_FILES;
    textOnButton: string = 'Last opp';

    constructor(
        private ngHttp: HttpClient,
        private errorService: ErrorService,
        private authService: AuthService,
        private fileService: FileService
    ) {}

    public ngOnInit() {
        this.textOnButton = this.buttonText;
    }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;

        if (source.files && source.files.length) {
            this.textOnButton = 'Laster opp...';
            const newFile = source.files[0];
            source.value = '';
            this.uploadFile(newFile);
        }
    }

    private uploadFile(file: File) {
        const data = new FormData();
        data.append('Token', this.authService.jwt);
        data.append('Key', this.authService.activeCompany.Key);
        data.append('Caption', ''); // Where should we get this from the user?
        data.append('File', <any>file);

        this.ngHttp.post<any>(this.baseUrl + '/api/file', data, {
            observe: 'body'
        }).subscribe(
            (res) => {
                // Files are uploaded to unifiles, and will get an externalid that
                // references the file in UE - get the UE file and add that to the
                // collection
                this.textOnButton = this.buttonText;

                this.fileService.Get(res.ExternalId).subscribe(
                    newFile => this.fileUploaded.emit(newFile),
                    err => this.errorService.handle(err)
                );
            }, err => {
                this.errorService.handle(err);
            }
        );
    }
}
