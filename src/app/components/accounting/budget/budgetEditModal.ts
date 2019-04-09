import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {Http} from '@angular/http';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {environment} from 'src/environments/environment';
import {ErrorService, FileService, UniFilesService, BudgetService} from '@app/services/services';
import {File} from '@app/unientities';
import {AuthService} from '@app/authService';
import {Subject, Observable} from 'rxjs';

@Component({
    selector: 'uni-budget-edit-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 25vw; min-width: 35rem">
            <header>
                <h1>{{ options.header }}</h1>
            </header>
            <article>
                <form class="uni-html-form">
                    <label>
                        <span>Navn</span>
                        <input type="text" [(ngModel)]="budgetName" name="name">
                    </label>
                    <label>
                        <span>År</span>
                        <mat-form-field style="width: 100%">
                            <mat-select [value]="currentYear"
                                (valueChange)="onYearSelect($event)"
                                placeholder="År">
                                <mat-option *ngFor="let y of years" [value]="y">
                                    {{ y }}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>
                    </label>
                    <label *ngIf="(isImport || isNew) && !!departments">
                        <span>Avdeling</span>
                        <mat-form-field style="width: 100%">
                            <mat-select [value]="currentDepartment"
                                (valueChange)="onDepartmentSelect($event)"
                                placeholder="Avdeling">
                                <mat-option *ngFor="let dep of departments" [value]="dep">
                                    {{ dep.Name }}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>
                    </label>
                </form>
                <div *ngIf="isImport || isNew">
                    <span>Filimport</span>
                    <div class="budget-file-import">
                        <input type="file" (change)="uploadFileChange($event)">
                    </div>
                </div>
                <mat-progress-bar
                    *ngIf="loading$ | async"
                    class="uni-progress-bar"
                    mode="indeterminate">
                </mat-progress-bar>
            </article>

            <footer class="center">
                <button class="c2a rounded" (click)="save()">{{ isNew ? 'Nytt budsjett' : 'Lagre' }}</button>
                <button (click)="close()">Avbryt</button>
            </footer>
        </section>
    `
})

export class UniBudgetEditModal implements OnInit, IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    years = [
        new Date().getFullYear() - 1,
        new Date().getFullYear(),
        new Date().getFullYear() + 1,
        new Date().getFullYear() + 2,
    ];
    currentYear = this.years[1];
    isNew: boolean = true;
    isImport: boolean = false;
    budgetID: number = 0;
    file: File;
    activeCompany: any;
    token: any;
    baseUrl: string = environment.BASE_URL_FILES;
    loading$: Subject<any> = new Subject();
    departments: any[];
    currentDepartment: any;
    budget: any = {
        ID: 0
    };

    budgetName: string = 'Budsjett for ' + this.currentYear;

    constructor(
        private authService: AuthService,
        private fileService: FileService,
        private uniFilesService: UniFilesService,
        private errorService: ErrorService,
        private budgetService: BudgetService,
        private http: Http
        ) {
            this.authService.authentication$.subscribe((authDetails) => {
            this.activeCompany = authDetails.activeCompany;
            this.token = authDetails.token;
        });
    }

    public ngOnInit() {
        if (this.options && this.options.data && this.options.data.budget) {
            this.budgetName = this.options.data.budget.Name;
            this.budgetID = this.options.data.budget.ID;
            this.currentYear = this.options.data.budget.AccountingYear;
            this.isNew = false;
            this.isImport = this.options.data.isImport;
            this.departments =  this.options.data.departments;

            if (this.departments.length) {
                this.currentDepartment = this.departments[0];
            }

            if (!this.years.includes(this.currentYear)) {
                this.years.push(this.options.data.budget.AccountingYear);
            }
        }
    }

    public uploadFileChange(event) {
        const source = event.srcElement || event.target;
        if (source.files && source.files.length) {
            this.file = source.files[0];
        }
    }

    public onYearSelect(year) {
        if (this.budgetName === 'Budsjett for ' + this.currentYear) {
            this.budgetName = 'Budsjett for ' + year;
        }
        this.currentYear = year;
    }

    public onDepartmentSelect(department) {
        this.currentDepartment = department;
    }

    private uploadFile(file: File) {
        const data = new FormData();
        data.append('Token', this.token);
        data.append('Key', this.activeCompany.Key);
        data.append('Caption', ''); // Where should we get this from the user?
        data.append('File', <any>file);

        return this.http.post(this.baseUrl + '/api/file', data)
            .map(res => res.json());
    }

    public save() {
        if (this.options && this.options.data && this.options.data.budget) {
            this.budget = this.options.data.budget;
        }

        this.budget.Name = this.budgetName;
        this.budget.AccountingYear = this.currentYear;

        this.loading$.next(true);

        let query;
        if (this.budgetID) {
            query = this.budgetService.Put(this.budgetID, this.budget);
        } else {
            query = this.budgetService.Post(this.budget);
        }

        query.subscribe((myBudget) => {
            if (this.file) {
                this.budget = myBudget;
                this.budgetID = myBudget.ID;
                this.uploadFile(this.file).subscribe((res) => {
                    this.fileService.Get(res.ExternalId).subscribe((newFile) => {
                        this.budgetService.importExcelTemplate(
                            this.budgetID,
                            newFile.ID,
                            (this.currentDepartment && this.currentDepartment.ID !== 'ALLDEPARTMENTSID') ? this.currentDepartment.ID : 0)
                        .subscribe((response) => {
                            this.loading$.complete();
                            this.onClose.emit(response.Budget);
                        }, err => {
                            this.errorService.handle(err);
                            this.loading$.next(false);
                        });
                    });
                }, err => {
                    this.loading$.next(false);
                    this.errorService.handle(err);
                });
            } else {
                this.loading$.complete();
                this.onClose.emit(myBudget);
            }
        });
    }

    public close() {
        this.onClose.emit();
    }
}
