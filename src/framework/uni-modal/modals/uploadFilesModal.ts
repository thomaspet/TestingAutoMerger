import {Component, Input, Output, EventEmitter} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UniHttp} from '../../core/http/http';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {ErrorService, FileService} from '../../../app/services/services';
import {AuthService} from '../../../app/authService';
import PerfectScrollbar from 'perfect-scrollbar';
import {environment} from 'src/environments/environment';
import {Observable, Subject} from 'rxjs';

export enum EntityForFileUpload {
    BANK = 1,
    EXPENSE = 2
}

@Component({
    selector: 'uni-file-upload-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header>Velg filer som skal lastes opp</header>

            <article>
                <p *ngIf="options?.message"> {{ options.message }}</p>
                <label class="upload-input" *ngIf="!files.length">
                    <i class="material-icons">cloud_upload</i>
                    <span>Velg {{ files.length ? 'flere' : '' }} filer</span>
                    <input type="file" (change)="uploadFile($event)" [disabled]="busy" multiple />
                </label>

                <mat-progress-bar
                    *ngIf="loading$ | async"
                    class="uni-progress-bar"
                    mode="indeterminate">
                </mat-progress-bar>

                <div *ngIf="files.length" class="upload-modal-list-container">
                    <span class="files-counter"> {{ getNumberOfSelected() }} filer valgt </span>
                    <ul class="file-selected-list-header">
                        <li>
                            <div style="display: flex;">
                                <i class="material-icons" (click)="selectAll()" style="color: var(--color-c2a)">
                                    {{ allFilesSelected ? 'check_box' : 'check_box_outline_blank' }}
                                </i>
                                <span> Filnavn  </span>
                                <span> Status </span>
                                <span> Filstørrelse </span>
                                <i class="material-icons" title="Fjern alle filene" (click)="removeAll()">delete_sweep</i>
                            </div>

                        </li>
                    </ul>
                    <ul class="file-selected-list" id="file-list">
                        <li *ngFor="let file of files; let i = index;">
                            <div style="display: flex;">
                                <i class="material-icons" (click)="file.selected = !file.selected" style="color: var(--color-c2a)">
                                    {{ file.selected ? 'check_box' : 'check_box_outline_blank' }}
                                </i>
                                <span class="bank-file-name-span"> {{ file.Name }} </span>
                                <span> {{ getStatusText(file) }} </span>
                                <span> {{ getFileSizeFormatted(file.Size) }} </span>
                                <i class="material-icons" title="Fjern fil" (click)="removeFile(i)">delete</i>
                            </div>

                        </li>
                    </ul>
                </div>
                <div class="upload-file-modal-error-message-container" *ngIf="hasErrors">
                    <i class="material-icons"> info </i>
                    <small class="upload-file-modal-error-message">
                        {{ message }}
                    </small>
                </div>
            </article>

            <footer class="center">
                <button (click)="close(true)" class="secondary"> Avbryt </button>
                <button class="c2a" [disabled]="getNumberOfSelected() < 1" (click)="close()">
                    {{ options?.buttonLabels?.accept || 'Last opp' }}
                </button>

            </footer>
        </section>
    `
})
export class UniFileUploadModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    CURRENT_ENTITY: EntityForFileUpload = EntityForFileUpload.BANK;
    loading$: Subject<boolean> = new Subject();
    scrollbar: PerfectScrollbar;
    baseUrl: string = environment.BASE_URL_FILES;
    files: any[] = [];
    uploadedFileIds: any[];
    hasErrors: boolean = false;
    message: string = '';
    allFilesSelected: boolean = false;

    constructor(
        private ngHttp: HttpClient,
        private http: UniHttp,
        private errorService: ErrorService,
        private authService: AuthService,
        private fileService: FileService
    ) {}

    ngOnInit() {
        if (this.options && this.options.data) {
            this.CURRENT_ENTITY = this.options.data.entity || EntityForFileUpload.BANK;
        }
    }

    public uploadFile(event) {
        const source = event.srcElement || event.target;
        let newFiles: any = Array.from(source.files);
        this.hasErrors = false;
        newFiles = newFiles.map(f => {f.selected = false; return f; });

       this.uploadAllFiles(newFiles);
    }

    private uploadAllFiles(uploadedFiles) {
        const uploadRequests: Observable<any>[] = [];
        uploadedFiles.forEach(f => uploadRequests.push(this.fileUploadFunction(f)));

        this.loading$.next(true);

        // New endpoint that takes array of files?
        Observable.forkJoin(uploadRequests).subscribe(result => {

            const getRequests: Observable<any>[] = [];

            result.forEach((file) => {
                getRequests.push(this.fileService.Get(file.ExternalId));
            });

            // New endpoint that takes array of ids?
            Observable.forkJoin(getRequests).subscribe((files) => {
                this.uploadedFileIds = files.map(f => f.ID);

                this.files = files;
                if (this.files.length) {
                    setTimeout(() => {
                     this.scrollbar = new PerfectScrollbar('#file-list');
                    });
                }

                if (this.CURRENT_ENTITY === EntityForFileUpload.BANK) {
                    this.handleBankFiles();
                } else if (this.CURRENT_ENTITY === EntityForFileUpload.EXPENSE) {
                    const tagQueries = [];
                    this.uploadedFileIds.forEach(id => {
                        tagQueries.push(this.fileService.tag(id, 'IncomingExpense'));
                    });

                    Observable.forkJoin(tagQueries).subscribe(() => {
                        this.loading$.next(false);
                        this.files = this.files.map(file => {
                            file.selected = true;
                            return file;
                        });
                    }, err => {
                        this.loading$.next(false);
                        this.hasErrors = true;
                        this.message = 'Noe gikk galt da vi prøvde å legge dokumentene i innboksen. Anbefaler at du trykker avbryt, ' +
                        'slik at filene blir slettet og modal lukker seg, og prøver på nytt.';
                    });
                }
            }, err => {
                this.errorService.handle('Kunne ikke laste opp filene. Lukk modal og prøv igjen.');
                this.loading$.next(false);
            });
        }, err => {
            this.loading$.next(false);
            this.errorService.handle(err);
        });
    }

    private fileUploadFunction(file) {
        const data = new FormData();
        data.append('Token', this.authService.jwt);
        data.append('Key', this.authService.activeCompany.Key);
        data.append('Caption', ''); // Where should we get this from the user?
        data.append('File', <any>file);

        return this.ngHttp.post(this.baseUrl + '/api/file', data, {observe: 'body'});
    }

    private handleBankFiles() {
        this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint('/paymentbatches?action=get-file-statuses-from-file-ids')
            .withBody(this.uploadedFileIds)
            .send()
            .map(res => res.body)
            .subscribe((statuses: number[]) => {
                this.loading$.next(false);
                this.files = this.files.map((f, i) => {
                    f.selected = statuses[i] === 0 || statuses[i] === 30001;
                    f.status = statuses[i];
                    if (!f.selected) {
                        this.hasErrors = true;
                        this.message = 'Noen av filene du har valgt har blitt brukt før. Disse er ikke sjekket av.' +
                        ' Hvis du vil kjøre de på nytt, må du krysse av checkboksen for de. ';
                    }
                    return f;
                });

                this.filterBankFiles();

            }, err => {
                this.errorService.handle('Kunne ikke hente status på filene');
                this.loading$.next(false);
        });
    }

    private filterBankFiles() {
        if (this.files.filter(f =>
            f.ContentType !== 'bank/OCR' &&
            f.ContentType !== 'bank/camt054' &&
            f.ContentType !== 'bank/PAIN002').length) {

                this.hasErrors = true;
                this.message += 'Noen filer har feil filtype og vil ikke bli lastet opp. Aksepterte filtyper er OCR, Camt054, og Pain002';

                this.files = this.files.filter(f =>
                    f.ContentType === 'bank/OCR' ||
                    f.ContentType === 'bank/camt054' ||
                    f.ContentType === 'bank/PAIN002');
        }
    }

    public removeFile(index) {
        this.fileService.Remove(this.files[index].ID).subscribe(() => {
            this.files.splice(index, 1);
            if (this.files.length) {
                setTimeout(() => {
                 this.scrollbar = new PerfectScrollbar('#file-list');
                });
            }
        });
    }

    public removeAll(isOnClose: boolean = false, deleteUncheckedBeforeSave: boolean = false) {
        const queries = [];
        let checked = null;
        this.loading$.next(true);
        this.message = !isOnClose ? 'Sletter alle filene...' : deleteUncheckedBeforeSave
        ? 'Sletter umarkerte filer før vi fortsetter'  : 'Sletter filene før vi lukker modalen..';
        this.hasErrors = true;

        if (deleteUncheckedBeforeSave) {
            checked = this.files.filter(f => f.selected).map(f => f.ID);
            this.files = this.files.filter(f => !f.selected);
        }

        this.files.forEach(file => {
            queries.push(this.fileService.Remove(file.ID));
        });

        // Recursive function to delete one file at a time..
        const deleteFiles = (id: number) => {
            this.fileService.Remove(id).subscribe(() => {
                this.files.shift();
                if (this.files.length) {
                    deleteFiles(this.files[0].ID);
                } else {
                    this.loading$.next(false);
                    this.message = '';
                    this.hasErrors = false;
                    this.scrollbar = null;
                    if (isOnClose) {
                        this.onClose.emit(checked);
                    }
                }
            }, err => {
                if (isOnClose) {
                    this.onClose.emit(checked);
                }
                this.errorService.handle(err);
                this.loading$.next(false);
                this.hasErrors = true;
                this.message = 'Noe gikk galt med sletting av fil. Prøv igjen';
            });
        };

        deleteFiles(this.files[0].ID);
    }

    public selectAll() {
        this.allFilesSelected = !this.allFilesSelected;
        this.files = this.files.map(f => {
            f.selected = this.allFilesSelected;
            return f;
        });
    }

    public getNumberOfSelected() {
        return this.files.filter(f => f.selected).length;
    }

    public getStatusText(file) {
        switch (file.status) {
            case 30001:
                return 'Prossesering feilet';
            case 20001:
                return 'Prosserering allerede i gang';
            case 40001:
                return 'Allerede registrert';
            default:
                return 'Ny';
        }
    }

    public getFileSizeFormatted(fileSize) {
        if (!fileSize) {
            return '-';
        }
        const sizeString = Math.ceil(fileSize / 1024);
        return sizeString + ' kb';
    }

    public close(cancel: boolean = false) {
        if (cancel) {
            if (this.files.length) {
                this.removeAll(true);
            } else {
                this.onClose.emit(null);
            }
        } else {
            // Delete unchecked files to avoid limbo-state files
            if (this.files.length > this.getNumberOfSelected()) {
                this.removeAll(true, true);
            } else {
                this.onClose.emit(this.files.filter(f => f.selected).map(f => f.ID));
            }
        }
    }
}
