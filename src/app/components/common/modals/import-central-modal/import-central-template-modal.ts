import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { ImportFileType, ImportDialogModel, ImportOption } from '@app/models/import-central/ImportDialogModel';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '@app/authService';
import { ErrorService, JobService } from '@app/services/services';
import { HttpClient } from '@angular/common/http';
import { UniModalService } from '@uni-framework/uni-modal';
import { DisclaimerModal } from '@app/components/import-central/modals/disclaimer/disclaimer-modal';


@Component({
    selector: 'import-central-template-modal',
    template:
        `<section role="dialog" class="uni-modal uni-redesign" style="width: 25vw; min-width: 35rem">
            <header>{{options.header}}</header>
            <article>
                <form class="uni-html-form">
                    <label>
                        {{options.data.conditionalStatement}}
                    </label>
                    <label>
                        {{options.data.formatStatement}}
                    </label>
                    <label>
                        {{options.data.downloadStatement}}
                    </label>
                    <label class="upload-input" *ngIf="options.data.hasTemplateAccess">
                        <i class="material-icons">cloud_download</i>
                    <a href="{{options.data.downloadTemplateUrl}}">Last ned mal</a>
                </label>
                </form>
                <div class="file-container">
                    <span>Filimport</span>
                    <div class="supplier-file-import">
                        <input type="file" (change)="uploadFileChange($event)" accept=".xlsx, .txt">
                    </div>
                </div>

                <a (click)="onShowDisclaimer()">Vis betingelser for Import</a>

                <section *ngIf="loading$ | async" class="modal-spinner">
                    <mat-spinner></mat-spinner>
                </section>
            </article>

            <footer class="center">
                <button class="c2a rounded" (click)="import()">Importer</button>
                <button (click)="close()">Avbryt</button>
            </footer>
        </section>
    `,
    styleUrls: ['./import-central-template-modal.sass']
})
export class ImportCentralTemplateModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    file: File;
    loading$: Subject<any> = new Subject();
    baseUrl: string = environment.BASE_URL_FILES;

    errorMessage = 'Velg fil';
    fileType: ImportFileType = ImportFileType.StandardizedExcelFormat;
    importOption: ImportOption = ImportOption.Skip;
    importModel: ImportDialogModel;

    constructor(
        private authService: AuthService,
        private errorService: ErrorService,
        private http: HttpClient,
        private jobService: JobService,
        private modalService: UniModalService
    ) {
        this.fileType = ImportFileType.StandardizedExcelFormat;
    }


    ngOnDestroy() {
        this.loading$.complete();
    }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;
        if (source.files && source.files.length) {
            const type = source.files[0].name.split(/[.]+/).pop();
            if (type === 'txt' || type === 'xlsx') {
                this.file = source.files[0];
                this.fileType = type === 'txt' ? ImportFileType.StandardUniFormat : ImportFileType.StandardizedExcelFormat;
            } else {
                this.errorMessage = 'Valgt fil har et filformat som ikke er støttet';
                this.errorService.handle(this.errorMessage);
            }
        }
    }

    private uploadFile(file: File) {
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

    public import() {
        if (!this.file) {
            this.errorService.handle(this.errorMessage);
        } else {
            this.loading$.next(true);
            // NOTE: comment when testing and hardcode the file in backend.
            this.uploadFile(this.file).subscribe((res) => {
                const company = this.authService.activeCompany;
                const fileURL = `${this.baseUrl}/api/externalfile/${company.Key}/${res.StorageReference}/${res.PublicToken}`;

                this.importModel = {
                    CompanyKey: company.Key,
                    CompanyName: company.Name,
                    Url: fileURL,
                    ImportFileType: this.fileType,
                    ImportOption : this.importOption
                };

                this.jobService.startJob(this.options.data.jobName, 0, this.importModel).subscribe(
                    () => {
                        this.loading$.complete();
                        this.close();
                    },
                    err => this.errorService.handle(err)
                );
            // NOTE: comment when testing
             }, err => {
                 this.loading$.next(false);
                 this.errorService.handle(err);
            });
        }
    }

    public onShowDisclaimer() {
        this.modalService.open(DisclaimerModal);
    }
    public close() {
        this.onClose.emit();
    }

}
