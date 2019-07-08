import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { environment } from 'src/environments/environment';
import { AuthService } from '@app/authService';
import { Http } from '@angular/http';
import { JobService } from '@app/services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { ImportFileType } from '@app/models/import-central/ImportDialogModel';
@Component({
    selector: 'import-template-modal',
    templateUrl: './import-template-modal.html',
    styleUrls: ['./import-template-modal.sass']
})
export class ImportTemplateModal implements OnInit, IUniModal {

    @Input() options: IModalOptions = {};

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild('file') fileElement: ElementRef<HTMLElement>;

    // view related variables
    isValidFileFormat: boolean = true;
    isFileSelected: boolean;
    isFileDetached: boolean;
    progressBarVal: number;
    showCancel: boolean;

    // controller realated variables
    fileServerUrl: string = environment.BASE_URL_FILES;
    companyKey: string;
    companyName: string;
    token: string;
    fileType: ImportFileType = ImportFileType.StandardizedExcelFormat;
    attachedFile: File;

    constructor(
        private authService: AuthService,
        private http: Http, private jobService: JobService,
        private toastService: ToastService) {
        this.authService.authentication$.take(1).subscribe((authDetails) => {
            this.companyKey = authDetails.activeCompany.Key;
            this.companyName = authDetails.activeCompany.Name;
            this.token = authDetails.token;
        });
    }

    ngOnInit(): void {
    }

    // Trigger click event of input file 
    public selectFile() {
        if (!this.isFileDetached) {
            if (this.fileElement) {
                this.fileElement.nativeElement.click();
            }
        }
        this.isFileDetached = false;
    }

    // Get file after user selected from file explorer
    public openFile(event) {
        this.onFileAttach(event, false);
    };

    // Enabaling file drag into the modal
    public dragFile(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    // Get file after user drop into the modal
    public dropFile(event) {
        event.stopPropagation();
        event.preventDefault();
        this.onFileAttach(event, true);
    }

    // Check if the selected file is in .xlsx file formal
    private isValidFormat(fileName: string): boolean {
        const type = fileName.split(/[.]+/).pop();
        // removed txt file type since it is not in the mockup
        if (type === 'xlsx') {
            this.isValidFileFormat = true;
            return true;
        }
        this.isValidFileFormat = false;
        return false
    }

    private uploadFileToFileServer(file: File) {
        const data = new FormData();
        data.append('Token', this.token);
        data.append('Key', this.companyKey);
        data.append('EntityType', this.options.data.entityType);
        data.append('Description', this.options.data.description);
        data.append('WithPublicAccessToken', 'true');
        data.append('File', <any>file);

        return this.http.post(this.fileServerUrl + '/api/file', data)
            .map(res => res.json());
    }

    private importFileToJobServer(jobName, importModel) {
        return this.jobService.startJob(jobName, 0, importModel).map(res => res);
    }

    private uploadFile(file: File) {
        this.uploadFileToFileServer(file).subscribe((res) => {
            let importModel = {
                CompanyKey: this.companyKey,
                CompanyName: this.companyName,
                Url: `${this.fileServerUrl}/api/externalfile/${this.companyKey}/${res.StorageReference}/${res._publictoken}`,
                ImportFileType: this.fileType
            }
            this.importFileToJobServer(this.options.data.jobName, importModel).subscribe(
                res => {
                    this.close();
                    this.showToast(file.name);
                },
            );
        }, err => {
            console.error(err);
        });
    }

    // common (drag&drop and file select) method to handle file attach
    private onFileAttach(event, isDrop: boolean) {
        let selectedFile;
        if (isDrop) {
            const files = event.dataTransfer.files;
            selectedFile = files[0];
        } else {
            const input = event.target;
            selectedFile = input.files[0];
        }
        this.attachedFile = selectedFile;
        const fileName = selectedFile.name;
        this.isFileSelected = false;
        if (!this.isValidFormat(fileName)) {
            return;
        }
        this.isFileSelected = true;
        setTimeout(() => {
            this.progressBarVal = 100;
            this.showCancel = true;
        }, 500)
    }

    public onFileDetach() {
        this.isFileSelected = false;
        this.isFileDetached = true;
        this.progressBarVal = 0;
        this.showCancel = false;
        this.attachedFile = null;
    }

    public importFile() {
        if (this.attachedFile) {
            this.uploadFile(this.attachedFile);
        }
        else {
            this.isValidFileFormat = false;
        }
    }

    private showToast(fileName: string) {
        this.toastService.addToast('', ToastType.good, ToastTime.forever,
            `Uploading ${this.options.data.type}s list ${fileName}`);
    }

    public close() {
        this.onClose.emit();
    }

}
