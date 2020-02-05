import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {environment} from 'src/environments/environment';
import {ErrorService, FileService, BudgetService} from '@app/services/services';
import {File} from '@app/unientities';
import {AuthService} from '@app/authService';
import {Subject} from 'rxjs';

@Component({
    selector: 'uni-budget-edit-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 25vw; min-width: 35rem">
            <header>{{ options.header }}</header>
            <article>
                <section>
                    <label class="uni-label">
                        <span>Navn</span>
                        <input type="text" [(ngModel)]="budgetName" name="name">
                    </label>
                    <label class="uni-label">
                        <span>År</span>
                        <select [ngModel]="currentYear" (ngModelChange)="onYearSelect($event)">
                            <option *ngFor="let year of years" [ngValue]="year">
                                {{year}}
                            </option>
                        </select>
                    </label>

                    <label class="uni-label" *ngIf="(isImport || isNew) && !!departments">
                        <span>Avdeling</span>
                        <mat-form-field style="width: 100%">
                            <mat-select [value]="currentDepartment"
                                (valueChange)="onDepartmentSelect($event)"
                                placeholder="Avdeling">
                                <mat-option *ngFor="let dep of departments" [value]="dep">
                                    {{ dep?.Name }}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>
                    </label>
                </section>

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

            <footer>
                <button class="secondary" (click)="close()">Avbryt</button>
                <button class="c2a" (click)="save()">{{ isNew ? 'Nytt budsjett' : 'Lagre' }}</button>
            </footer>
        </section>
    `
})

export class UniBudgetEditModal implements OnInit, IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

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
        private errorService: ErrorService,
        private budgetService: BudgetService,
        private http: HttpClient
    ) {}

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
        data.append('Token', this.authService.jwt);
        data.append('Key', this.authService.activeCompany.Key);
        data.append('Caption', ''); // Where should we get this from the user?
        data.append('File', <any>file);

        return this.http.post<any>(this.baseUrl + '/api/file', data, {
            observe: 'body'
        });
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
