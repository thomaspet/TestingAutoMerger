import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { environment } from 'src/environments/environment';
import { ErrorService, FileService, UniFilesService, BudgetService, JobService } from '@app/services/services';
import { File } from '@app/unientities';
import { AuthService } from '@app/authService';
import { Subject, Observable } from 'rxjs';

@Component({
    selector: 'uni-product-import-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 25vw; min-width: 35rem">
            <header>
                <h1>Importer produkter</h1>
            </header>
            <article>
                <form class="uni-html-form">
                    <label>
                    Om et produkt med likt produktnummer finnes fra før, vil det importerte produktet ikke lagres
                    </label>
                </form>
                <div>
                    <span>Filimport</span>
                    <div class="product-file-import">
                        <input type="file" (change)="uploadFileChange($event)">
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
    styleUrls: ['./productList.sass']
})

export class UniProductImportModal implements OnInit, IUniModal {

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    file: File;
    activeCompany: any;
    companyName: string;
    token: any;
    loading$: Subject<any> = new Subject();
    baseUrl: string = environment.BASE_URL_FILES;


    constructor(
        private authService: AuthService,
        private fileService: FileService,
        private errorService: ErrorService,
        private http: Http,
        private jobService: JobService
    ) {
        this.authService.authentication$.subscribe((authDetails) => {
            this.activeCompany = authDetails.activeCompany;
            this.companyName = authDetails.activeCompany.Name;
            this.token = authDetails.token;
        });
    }

    public ngOnInit() { }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;
        if (source.files && source.files.length) {
            this.file = source.files[0];
        }
    }



    private uploadFile(file: File) {
        const data = new FormData();
        data.append('Token', this.token);
        data.append('Key', this.activeCompany.Key);
        // data.append('EntityType', 'Product');
        data.append('Description', 'Import central - product');
        data.append('WithPublicAccessToken', 'true'); 
        data.append('File', <any>file);

        return this.http.post(this.baseUrl + '/api/file', data)
            .map(res => res.json());
    }


    public import() {
        this.loading$.next(true);
        this.uploadFile(this.file).subscribe((res) => {
            var fileURL = `${this.baseUrl}/api/externalfile/${this.activeCompany.Key}/${res.StorageReference}/ ${res._publictoken}`;
            this.jobService.startJob('<<product_import_job_name>>', 0, {Url:fileURL, CompanyKey:this.activeCompany.Key, CompanyName: this.companyName}).subscribe(
                res => {
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

    public close() {
        this.onClose.emit();
    }
}
