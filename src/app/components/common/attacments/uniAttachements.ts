import {Component, Input, SimpleChanges, Output, EventEmitter, ViewChild} from '@angular/core';
import {UniTableConfig, UniTableColumn, UniTableColumnType, UniTable} from '../../../../framework/ui/unitable/index';
import {Http} from '@angular/http';
import {File, FileEntityLink} from '../../../unientities';
import {UniHttp} from '../../../../framework/core/http/http';
import {AuthService} from '../../../authService';
import {FileService, ErrorService, UniFilesService, StatisticsService} from '../../../services/services';
import {ImageUploader} from '../../../../framework/uniImage/imageUploader';
import {environment} from 'src/environments/environment';
import {ImageModal} from '../modals/ImageModal';
import {UniImageSize} from '../../../../framework/uniImage/uniImage';
import {UniModalService} from '../../../../framework/uni-modal';
import {saveAs} from 'file-saver';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs/Observable';

const PAPERCLIP = '📎';

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
                <uni-table
                    [resource]="files"
                    [config]="tableConfig$ | async"
                    (rowDeleted)="onRowDeleted($event)"
                    (rowSelected)="onRowSelected($event)"
                    (rowSelectionChanged)="onRowSelectionChanged($event)">
                </uni-table>
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
    `,
})
export class UniAttachments {
    @ViewChild(UniTable) private table: UniTable;

    @Input() public entity: string;
    @Input() public entityID: number;
    @Input() public size: UniImageSize;
    @Input() public readonly: boolean;
    @Input() public uploadConfig: IUploadConfig;
    @Input() public showFileList: boolean = true;
    @Input() public uploadWithoutEntity: boolean = false;
    @Input() public downloadAsAttachment: boolean = false;
    @Input() public headerText: string = 'Vedlegg';
    @Input() public hideLabel: boolean;

    @Output() public fileUploaded: EventEmitter<File> = new EventEmitter<File>();

    private baseUrl: string = environment.BASE_URL_FILES;

    private token: any;
    private activeCompany: any;
    private didTryReAuthenticate: boolean = false;

    private uploading: boolean;

    private files: File[] = [];
    private fileLinks: FileEntityLink[] = [];
    private tableConfig$: ReplaySubject<UniTableConfig>;

    constructor(
        private ngHttp: Http,
        private http: UniHttp,
        private imageUploader: ImageUploader,
        private errorService: ErrorService,
        private fileService: FileService,
        private uniFilesService: UniFilesService,
        private authService: AuthService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService
    ) {
        authService.authentication$.subscribe((authDetails) => {
            this.activeCompany = authDetails.activeCompany;
        });

        authService.filesToken$.subscribe(token => this.token = token);

        this.tableConfig$ = new ReplaySubject<UniTableConfig>(1);
    }

    public ngOnInit() {
        this.tableConfig$.next(this.getConfig());
    }

    private getConfig(): UniTableConfig {
        let fileNameCol = new UniTableColumn('Name', 'Filnavn', UniTableColumnType.Text, false);
        let fileSizeCol = new UniTableColumn('Size', 'Størrelse', UniTableColumnType.Text, false)
            .setTemplate(file => {
                return `${Math.ceil(file.Size / 1024)} KB`;
            })
            .setWidth('7rem')
            .setAlignment('right');

        return new UniTableConfig('attachments')
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
                .map(res => res.json())
        ]).subscribe(res => {
            this.fileLinks = res[0];
            let files = res[1];

            this.files = files.map(file => {
                let link: FileEntityLink = this.fileLinks.find(link => link.FileID === file.ID);
                if (link) { file._rowSelected = link.IsAttachment; }
                return file;
            });
        }, err => this.errorService.handle(err));
    }

    private isDefined(value: any) {
        return (value !== undefined && value !== null && value !== 0);
    }

    public attachmentClicked(attachment: File) {
        if (!this.downloadAsAttachment) {
            let data = {
                entity: this.entity,
                entityID: this.entityID,
                showFileID: attachment.ID,
                readonly: true
            };

            this.modalService.open(ImageModal, { data: data });

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

    public onDrop(event, dropData) {
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
            data.append('EntityID', this.entityID.toString());
        }
        data.append('Caption', ''); // where should we get this from the user?
        data.append('File', <any> file);

        this.ngHttp.post(this.baseUrl + '/api/file', data)
            .map(res => res.json())
            .subscribe((res) => {
                this.uploading = false;
                this.fileUploaded.emit(res);
                this.getFiles();
            }, err => {
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
                            // not able to reauthenticate
                            this.errorService.handle(err);
                        });
                });
        }
    }

    public onRowSelectionChanged(event) {
        let files = !event ? this.table.getTableData() : [event.rowModel];
        files.map(file => {
            let link = this.fileLinks.find(link => link.FileID === file.ID);
            if (file._rowSelected !== link.IsAttachment) {
                // Save is attachment flag
                this.fileService.setIsAttachment(this.entity, this.entityID, file.ID, !link.IsAttachment).subscribe(() => {
                    link.IsAttachment = !link.IsAttachment;
                }, err => {
                    file._rowSelected = !file._rowSelected;
                    this.table.updateRow(file._originalIndex, file);
                    this.errorService.handle(err);
                });
            }
        });
    }

    public onRowSelected(event) {
        let file = event.rowModel;
        this.attachmentClicked(file);
    }

    public onRowDeleted(event) {
        let file = event.rowModel;

        this.fileService.deleteOnEntity(this.entity, this.entityID, file.ID)
            .subscribe(
                res => this.getFiles(),
                err => this.errorService.handle(err)
            );
    }
}
