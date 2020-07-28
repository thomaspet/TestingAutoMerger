import {Component, Input, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {UniTableConfig, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {HttpClient} from '@angular/common/http';
import {File, FileEntityLink} from '../../../unientities';
import {UniHttp} from '../../../../framework/core/http/http';
import {AuthService} from '../../../authService';
import {FileService, ErrorService, UniFilesService, StatisticsService} from '../../../services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import {environment} from 'src/environments/environment';
import {ImageModal} from '../modals/ImageModal';
import {UniImageSize} from '../../../../framework/uniImage/uniImage';
import {UniModalService} from '../../../../framework/uni-modal';
import {saveAs} from 'file-saver';
import {Observable} from 'rxjs';

export interface IUploadConfig {
    isDisabled?: boolean;
    disableMessage?: string;
}

@Component({
    selector: 'uni-attachments',
    template: `
        <label *ngIf="!readonly && !uploadConfig?.isDisabled"
            class="upload-input"
            [attr.aria-disabled]="uploadConfig?.isDisabled || uploading">

            <i class="material-icons">cloud_upload</i>
            <span>Last opp dokument</span>

            <span class="tooltip" *ngIf="tooltip">
                <i class="material-icons">info_outline</i>
                {{tooltip}}
            </span>

            <input type="file"
                (change)="uploadFileChange($event)"
                [attr.aria-disabled]="uploadConfig?.isDisabled"
                [disabled]="uploadConfig?.isDisabled"
            />
        </label>

        <ag-grid-wrapper
            *ngIf="showFileList"
            [resource]="files"
            [config]="tableConfig"
            (rowDelete)="onRowDeleted($event)"
            (rowClick)="attachmentClicked($event)"
            (rowSelectionChange)="onRowSelectionChange($event)">
        </ag-grid-wrapper>
    `,
})
export class UniAttachments {
    @Input() entity: string;
    @Input() entityID: number;
    @Input() size: UniImageSize;
    @Input() readonly: boolean;
    @Input() uploadConfig: IUploadConfig;
    @Input() showFileList: boolean = true;
    @Input() uploadWithoutEntity: boolean = false;
    @Input() canSendEHF: boolean = false;
    @Input() tooltip: string;

    @Output() fileUploaded: EventEmitter<File> = new EventEmitter();
    @Output() selectedFileSize: EventEmitter<number> = new EventEmitter();

    private baseUrl: string = environment.BASE_URL_FILES;

    private fileLinks: FileEntityLink[] = [];
    validEHFFileTypes: string[] = ['.csv', '.pdf', '.png', '.jpg', '.xlsx', '.ods'];

    uploading: boolean;
    files: File[] = [];
    tableConfig: UniTableConfig;
    
    constructor(
        private ngHttp: HttpClient,
        private http: UniHttp,
        private errorService: ErrorService,
        private fileService: FileService,
        private uniFilesService: UniFilesService,
        private authService: AuthService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService,
        private toast: ToastService
    ) {
        const fileNameCol = new UniTableColumn('Name', 'Filnavn');
        const fileSizeCol = new UniTableColumn('Size', 'Størrelse')
            .setTemplate(file => `${Math.ceil((file.Size || 0) / 1024)} KB`)
            .setWidth('7rem');

        this.tableConfig = new UniTableConfig('attachments', false)
            .setAutoAddNewRow(false)
            .setColumns([fileNameCol, fileSizeCol])
            .setDeleteButton(true)
            .setSearchable(false)
            .setMultiRowSelect(true);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (
            this.showFileList
            && (changes['entity']
            || changes['entityID'])
            && this.entity
            && this.isDefined(this.entityID)
        ) {
            this.getFiles();
        } else {
            this.files = [];
        }
    }

    private getFiles() {
        Observable.forkJoin([
            this.statisticsService.GetAllUnwrapped(`model=FileEntityLink`
                + `&select=ID as ID,FileID as FileID,IsAttachment as IsAttachment`
                + `&filter=EntityType eq '${this.entity}' and EntityID eq ${this.entityID}`
            ),
            this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint(`files/${this.entity}/${this.entityID}`)
                .send()
                .map(res => res.body)
        ]).subscribe(res => {
            this.fileLinks = res[0];
            const files = res[1];

            this.files = files.map(file => {
                const link: FileEntityLink = this.fileLinks.find(l => l.FileID === file.ID);
                if (link) { file._rowSelected = link.IsAttachment; }
                return file;
            });
        }, err => this.errorService.handle(err));
    }

    private isDefined(value: any) {
        return (value !== undefined && value !== null && value !== 0);
    }

    public attachmentClicked(attachment: File) {
        const data = {
            entity: this.entity,
            entityID: this.entityID,
            showFileID: attachment.ID,
            readonly: true
        };

        this.modalService.open(ImageModal, { data: data });
    }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;

        if (!this.uploadWithoutEntity && (!this.entity || !this.isDefined(this.entityID))) {
            throw new Error(`Tried to upload failed with either entity (${this.entity})`
                 + ` or entityID (${this.entityID}) being null, and uploadWithoutEntity being false`);
        }

        if (source.files && source.files.length) {
            this.uploading = true;
            const newFile = source.files[0];
            source.value = '';
            this.uploadFile(newFile);
        }
    }

    private uploadFile(file: File) {
        const activeCompany = this.authService.activeCompany;
        const data = new FormData();

        if (this.canSendEHF) {
            const invalidFileType = !this.validEHFFileTypes.some(type => {
                const fileName = (file['name'] || '').toLowerCase();
                return fileName.includes(type.toLowerCase());
            });

            if (invalidFileType) {
                this.toast.addToast('Ugyldig filtype for vedlegg', ToastType.warn, 10,
                'Du har valgt en fil som ikke er godkjent som vedlegg for EHF, og vil ikke bli lagt til som vedlegg ' +
                'om du velger utsendelse via EHF. Gyldige formater er CSV, PDF, PNG, JPG, XLSX og ODS.');
            }
        }

        data.append('Token', this.authService.jwt);
        data.append('Key', activeCompany.Key);
        if (this.entity) {
            data.append('EntityType', this.entity);
        }
        if (this.entityID) {
            data.append('EntityID', this.entityID.toString());
        }
        data.append('Caption', ''); // where should we get this from the user?
        data.append('File', <any> file);

        this.ngHttp.post<File>(this.baseUrl + '/api/file', data, {
            observe: 'body'
        }).subscribe(
            (res) => {
                this.uploading = false;
                this.fileUploaded.emit(res);
                this.getFiles();
            }, err => {
                this.errorService.handle(err);
            }
        );
    }

    onRowSelectionChange(selectedFiles: File[]) {
        this.fileLinks.forEach(link => {
            const isSelected = selectedFiles.some(f => f.ID === link.FileID);
            if (isSelected !== link.IsAttachment) {
                link.IsAttachment = !link.IsAttachment;
                this.fileService.setIsAttachment(
                    this.entity, this.entityID, link.FileID, link.IsAttachment
                ).subscribe(
                    () => {},
                    err => {
                        this.errorService.handle(err);
                        link.IsAttachment = !link.IsAttachment;
                    }
                );
            }
        });

        var selectedSize = selectedFiles.map(file => parseInt(file.Size)).reduce((a, b) => a + b, 0);
        this.selectedFileSize.emit(selectedSize);
    }

    onRowDeleted(file) {
        this.fileService.deleteOnEntity(
            this.entity, this.entityID, file.ID
        ).subscribe(
            () => this.getFiles(),
            err => this.errorService.handle(err)
        );
    }
}
