import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { IModalOptions, IUniModal, UniModalService } from '@uni-framework/uni-modal';
import { environment } from 'src/environments/environment';
import { AuthService } from '@app/authService';
import { HttpClient } from '@angular/common/http';
import { JobService, ErrorService, PayrollrunService, UserService } from '@app/services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { ImportFileType, TemplateType, OrderOptions, ImportOption } from '@app/models/import-central/ImportDialogModel';
import { Subject } from 'rxjs';
import { DisclaimerModal } from '../../../disclaimer/disclaimer-modal';
import { ISelectConfig } from '@uni-framework/ui/uniform';
import { User } from '@uni-entities';

@Component({
    selector: 'import-order-modal',
    templateUrl: './import-order-modal.html',
    styleUrls: ['./import-order-modal.sass']
})
export class ImportOrderModal implements OnInit, IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    @ViewChild('file') fileElement: ElementRef<HTMLElement>;

    // view related variables
    isValidFileFormat: boolean = true;
    isFileSelected: boolean;
    isFileDetached: boolean;
    progressBarVal: number;
    showCancel: boolean;
    loading$: Subject<any> = new Subject();
    txtType = ImportFileType.StandardUniFormat;

    // controller realated variables
    fileServerUrl: string = environment.BASE_URL_FILES;
    fileType: ImportFileType = ImportFileType.StandardizedExcelFormat;

    user: User = new User();

    // import options
    draft: OrderOptions = OrderOptions.Draft;
    post: OrderOptions = OrderOptions.Post;
    config: ISelectConfig;
    operators: any[] = [];
    selectedOption = {
        name: 'Kladd',
        type: OrderOptions.Draft
    };

    attachedFile: File;
    baseUrl: string = environment.BASE_URL_FILES;

    constructor(
        public authService: AuthService,
        private http: HttpClient,
        private jobService: JobService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private userService: UserService,
    ) {
        this.userService.getCurrentUser().subscribe(res => {
            this.user = res;
        });
    }

    ngOnInit(): void {
        this.config = {
            placeholder: 'File type',
            searchable: false,
            displayProperty: 'name',
            hideDeleteButton: true
        };

        this.operators = [
            {
                name: 'Kladd',
                type: OrderOptions.Draft
            },
            {
                name: 'Registrert',
                type: OrderOptions.Post
            }
        ];
    }

    public onSelectChange(selectedItem) {
        this.selectedOption = selectedItem;
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
    }

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
        if (type === 'txt' || type === 'xlsx' || type === 'csv') {
            this.isValidFileFormat = true;
            switch (type) {
                case 'txt':
                    this.fileType = ImportFileType.StandardUniFormat;
                    break;
                case 'xlsx':
                    this.fileType = ImportFileType.StandardizedExcelFormat;
                    break;
                case 'csv':
                    this.fileType = ImportFileType.StandardizedCSVFormat;
                    break;
                default:
                    this.fileType = ImportFileType.StandardizedExcelFormat;
            }
            return true;
        }
        this.isValidFileFormat = false;
        return false;
    }

    private uploadFileToFileServer(file: File) {
        const data = new FormData();
        data.append('Token', this.authService.jwt);
        data.append('Key', this.authService.activeCompany.Key);
        data.append('EntityType', this.options.data.entityType);
        data.append('Description', this.options.data.description);
        data.append('WithPublicAccessToken', 'true');
        data.append('File', <any>file);

        return this.http.post<any>(this.baseUrl + '/api/file', data, {
            observe: 'body'
        });
    }

    private importFileToJobServer(jobName, importModel) {
        return this.jobService
            .startJob(jobName, 0, importModel)
            .map(res => res);
    }

    private uploadFile(file: File) {
        let dataToImport = {};
        this.loading$.next(true);
        // NOTE: comment when testing and hardcode the file in backend.
        this.uploadFileToFileServer(file).subscribe(
            res => {
                const company = this.authService.activeCompany;
                const fileURL = `${this.baseUrl}/api/externalfile/${company.Key}/${res.StorageReference}/${res._publictoken}`;
                this.loading$.next(false);
                const importModel = {
                    CompanyKey: company.Key,
                    CompanyName: company.Name,
                    Url: fileURL,
                    ImportFileType: this.fileType,
                    ImportOption: ImportOption.Duplicate,
                    OtherParams: {
                        isDraft: this.selectedOption.type === OrderOptions.Draft
                            ? true
                            : false,
                    }
                };
                dataToImport = importModel;

                this.loading$.next(true);
                this.importFileToJobServer(this.options.data.jobName, dataToImport).subscribe(
                    () => {
                        this.close();
                        this.showToast(file.name, this.options.data.entity);
                        this.loading$.next(false);
                    },
                    err => {
                        this.errorService.handle(err);
                        this.loading$.next(false);
                    }
                );
                // NOTE: comment when testing.
            },
            err => {
                this.loading$.next(false);
                this.errorService.handle(err);
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
        }, 500);
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
        } else {
            this.isValidFileFormat = false;
        }
    }

    // show success message
    private showToast(fileName: string, type: TemplateType) {
        this.toastService.addToast(
            '',
            ToastType.good,
            ToastTime.medium,
            `Opplasting av ${this.options.data.type} fra ${fileName} var vellykket`
        );
    }

    public close() {
        this.onClose.emit();
    }

    public openDisclaimerNote() {
        this.modalService.open(DisclaimerModal).onClose.subscribe(val => { });
    }
}
