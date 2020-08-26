import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IModalOptions, IUniModal, UniModalService } from '@uni-framework/uni-modal';
import { environment } from 'src/environments/environment';
import { AuthService } from '@app/authService';
import { HttpClient } from '@angular/common/http';
import { JobService, ErrorService, SharedPayrollRunService } from '@app/services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { ImportFileType, ImportOption, TemplateType } from '@app/models/import-central/ImportDialogModel';
import { Subject } from 'rxjs';
import { ISelectConfig } from '@uni-framework/ui/uniform';
import { DisclaimerModal } from '../disclaimer/disclaimer-modal';
@Component({
    selector: 'import-template-modal',
    templateUrl: './import-template-modal.html',
    styleUrls: ['./import-template-modal.sass']
})
export class ImportTemplateModal implements OnInit, IUniModal {
    @ViewChild('file') fileElement: ElementRef<HTMLElement>;
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    // view related variables
    isValidFileFormat: boolean = true;
    isFileSelected: boolean;
    isFileDetached: boolean;
    progressBarVal: number;
    showCancel: boolean;
    loading$: Subject<any> = new Subject();
    payrollType: TemplateType = TemplateType.Payroll;
    mainLedgerType: TemplateType = TemplateType.MainLedger;

    // saft related
    saftType: TemplateType = TemplateType.Saft;
    voucherType: TemplateType = TemplateType.Voucher;
    orderType: TemplateType = TemplateType.Order;
    isOrderDraft: boolean = false;
    isOpening: boolean = false;
    isKeepRecords: boolean = false;
    isUpdate: boolean = false;
    isAutomatic: boolean = false;

    selectedPayroll = {
        name: 'no payrolls found',
        id: 0
    };

    operators: any[] = [];
    config: ISelectConfig;

    // controller realated variables
    fileServerUrl: string = environment.BASE_URL_FILES;
    fileType: ImportFileType = ImportFileType.StandardizedExcelFormat;

    // options in radio buttons (import options)
    importOption: ImportOption = ImportOption.Skip;
    skip: ImportOption = ImportOption.Skip;
    override: ImportOption = ImportOption.Override;
    duplicate: ImportOption = ImportOption.Duplicate;

    attachedFile: File;
    baseUrl: string = environment.BASE_URL_FILES;

    constructor(
        public authService: AuthService,
        private http: HttpClient,
        private jobService: JobService,
        private toastService: ToastService,
        private payrollService: SharedPayrollRunService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) { }

    ngOnInit(): void {
        if (this.options.data.entity == this.payrollType) {
            this.config = {
                placeholder: 'File type',
                searchable: false,
                displayProperty: 'name',
                hideDeleteButton: true
            };
            this.operators = [];
            this.payrollService.getAll(`filter=StatusCode eq 0 or StatusCode eq null&orderby=ID desc`, true).subscribe(
                res => {
                    res.forEach(pay => {
                        this.operators.push({ name: pay.Description, id: pay.ID });
                    });
                    if (this.operators.length) {
                        this.selectedPayroll = this.operators[0];
                    }
                },
                err => this.errorService.handle(err)
            );

        }
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
        return false
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
        return this.jobService.startJob(jobName, 0, importModel).map(res => res);
    }

    private uploadFile(file: File) {
        let dataToImport = {};
        this.loading$.next(true);
        // NOTE: comment when testing and hardcode the file in backend.
        this.uploadFileToFileServer(file).subscribe(
            (res) => {
                const company = this.authService.activeCompany;
                const fileURL = `${this.baseUrl}/api/externalfile/${company.Key}/${res.StorageReference}/${res.PublicToken}`;
                this.loading$.next(false);
                const importModel: any = {
                    CompanyKey: company.Key,
                    CompanyName: company.Name,
                    Url: fileURL,
                    ImportFileType: this.fileType,
                    ImportOption: this.importOption,
                    OtherParams: { payrollId: this.selectedPayroll.id }
                };

                dataToImport = importModel;
                // if saft
                if (this.options.data.entity === this.saftType) {
                    const saftModel = {
                        FileID: res.ExternalId,
                        FileName: res.Name,
                        CompanyKey: company.Key,
                        IncludeStartingBalance: this.isOpening,
                        ReuseExistingNumbers: this.isKeepRecords,
                        UpdateExistingData: this.isUpdate,
                        Automark: this.isAutomatic
                    };
                    dataToImport = saftModel;
                }


                this.loading$.next(true);
                this.importFileToJobServer(this.options.data.jobName, dataToImport).subscribe(
                    () => {
                        this.close();
                        this.showToast(file.name, this.options.data.entity);
                        this.loading$.next(false);
                    },
                    err => { this.errorService.handle(err); this.loading$.next(false); }
                );
                // NOTE: comment when testing.
            },
            err => {
                this.loading$.next(false);
                this.errorService.handle(err);
            }
        );
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

    // show success message
    private showToast(fileName: string, type: TemplateType) {
        if (type != this.saftType) {
            this.toastService.addToast('', ToastType.good, ToastTime.medium,
            `Opplasting av ${this.options.data.type} fra ${fileName} var vellykket`);
        } else {
            this.toastService.addToast('', ToastType.good, ToastTime.medium,
                'Du kan lese inn filen flere ganger dersom det skulle oppstå problemer');
        }
    }

    public onSelectChange(selectedItem) {
        this.selectedPayroll = selectedItem;
    }

    public close() {
        this.onClose.emit();
    }

    public openDisclaimerNote() {
        this.modalService.open(DisclaimerModal)
            .onClose.subscribe((val) => { });
    }

}
