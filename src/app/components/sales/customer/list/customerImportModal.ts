import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import { IUniModal } from '@uni-framework/uni-modal';
import { ErrorService, JobService } from '@app/services/services';
import { File } from '@app/unientities';
import { AuthService } from '@app/authService';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ImportFileType, ImportDialogModel } from '@app/models/sales/ImportDialogModel';

@Component({
    selector: 'uni-customer-import-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 25vw; min-width: 35rem">
            <header>
                <h1>Importer Kunder</h1>
            </header>
            <article>
                <form class="uni-html-form">
                    <label>
                        Om en kunde med likt kundenummer finnes fra før, vil den importerte kunden ikke lagres. Om kundenumrene ikke
                        passer inn i valgt kundenummerserie vil de avvises
                    </label>
                </form>

                <div>
                    <span>Filimport</span>
                    <div class="customer-file-import">
                        <input type="file" (change)="uploadFileChange($event)" accept=".xlsx, .txt">
                    </div>
                </div>
                <mat-progress-bar *ngIf="loading$ | async" class="uni-progress-bar" mode="indeterminate">
                </mat-progress-bar>
            </article>

            <footer class="center">
                <button class="c2a rounded" (click)="import()">Importer</button>
                <button (click)="close()">Avbryt</button>
            </footer>
        </section>
    `,
    styleUrls: ['./customerList.sass']
})

export class UniCustomerImportModal implements OnInit, IUniModal {

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    file: File;
    activeCompany: any;
    companyName: string;
    token: any;
    loading$: Subject<any> = new Subject();
    baseUrl: string = environment.BASE_URL_FILES;

    errorMessage = 'Please select a file';
    fileType: ImportFileType = ImportFileType.StandardizedExcelFormat;
    importModel: ImportDialogModel;

    constructor(
        private authService: AuthService,
        private errorService: ErrorService,
        private http: Http,
        private jobService: JobService
    ) {
        this.authService.authentication$.subscribe((authDetails) => {
            this.activeCompany = authDetails.activeCompany;
            this.companyName = authDetails.activeCompany.Name;
            this.token = authDetails.token;
        });
        this.fileType = ImportFileType.StandardizedExcelFormat;
    }

    public ngOnInit() { }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;
        if (source.files && source.files.length) {
            const type = source.files[0].name.split(/[.]+/).pop();
            if (type === 'txt' || type === 'xlsx') {
                this.file = source.files[0];
                this.fileType = type === 'txt' ? ImportFileType.StandardUniFormat : ImportFileType.StandardizedExcelFormat;
            } else {
                this.errorMessage = 'Selected file format dose not support!';
                this.errorService.handle(this.errorMessage);
            }
        }
    }

    private uploadFile(file: File) {
        const data = new FormData();
        data.append('Token', this.token);
        data.append('Key', this.activeCompany.Key);
        data.append('EntityType', 'Customer');
        data.append('Description', 'Import central - customer');
        data.append('WithPublicAccessToken', 'true');
        data.append('File', <any>file);

        return this.http.post(this.baseUrl + '/api/file', data)
            .map(res => res.json());
    }

    public import() {
        if (!this.file) {
            this.errorService.handle(this.errorMessage);
        } else {
            this.loading$.next(true);
            this.uploadFile(this.file).subscribe((res) => {
                const fileURL = `${this.baseUrl}/api/externalfile/${this.activeCompany.Key}/${res.StorageReference}/${res._publictoken}`;
                this.importModel = {
                    CompanyKey: this.activeCompany.Key,
                    CompanyName: this.companyName,
                    Url: fileURL,
                    ImportFileType: this.fileType
                };

                this.jobService.startJob('CustomerImportJob', 0, this.importModel).subscribe(
                    () => {
                        this.loading$.complete();
                        this.close();
                    },
                    err => this.errorService.handle(err)
                );
            }, err => {
                this.loading$.next(false);
                this.errorService.handle(err);
            });
        }
    }

    public close() {
        this.onClose.emit();
    }
}

