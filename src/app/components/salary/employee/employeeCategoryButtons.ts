import {Component, Input, SimpleChanges, OnChanges} from '@angular/core';
import {EmployeeCategory} from '../../../unientities';
import {EmployeeService, EmployeeCategoryService, ErrorService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';

declare var jQuery;

@Component({
    selector: 'employeecategory-buttons',
    template: `
        <section class="poster_tags" [attr.aria-busy]="busy">

            <ul class="poster_tags_list">
                <li *ngFor="let category of selectedCategories; let idx = index">
                    {{category.Name}}
                    <button class="remove" (click)="removeCategory(category, idx)">Remove</button>
                </li>
            </ul>

            <button class="poster_tags_addBtn"
                    (click)="addingTags = !addingTags"
                    [ngClass]="{'-is-active': addingTags}">
                Legg til kategori&hellip;
            </button>

            <div class="poster_tags_addDropdown" [ngClass]="{'-is-active': addingTags}">

                <input type="text" placeholder="Søk kategorier…"
                [(ngModel)]="catName" (keyup)="filterCategories(catName)" autofocus/>

                <ul (click)="addingTags = false; catName = ''" *ngIf="catName">
                    <li *ngFor="let category of filteredCategories; let idx = index"
                        (click)="selectCategory(category, idx)"
                    >
                        {{category.Name}}
                    </li>
                    <li class="poster_tags_addNew" (click)="createAndSelectCategory(catName)">
                    Opprett <strong> '{{catName}}'</strong>…</li>
                </ul>
            </div>

        </section>
    `
})

export class EmployeeCategoryButtons implements OnChanges {
    @Input()
    private selectedEmployee: any;

    public busy: boolean;
    private categories: EmployeeCategory[];
    private filteredCategories: EmployeeCategory[];
    private selectedCategories: EmployeeCategory[];


    constructor(
        private employeeService: EmployeeService,
        private employeeCategoryService: EmployeeCategoryService,
        private errorService: ErrorService
    ) {
    }

    public ngOnChanges(changes: SimpleChanges) {
        let previous = changes['selectedEmployee'].previousValue;
        let current = changes['selectedEmployee'].currentValue;

        if (!previous || previous.ID !== current.ID) {
            this.refreshCategories();
        }
    }

    private refreshCategories() {
        this.busy = true;
        Observable.forkJoin(
            this.employeeService.getEmployeeCategories(this.selectedEmployee.ID),
            this.employeeCategoryService.GetAll('')
        )
        .subscribe((response: any) => {
            this.selectedCategories = response[0] || [];
            this.categories = response[1] || [];

            // remove selected categories from available categories
            this.categories = this.categories.filter((category) => {
                this.selectedCategories.forEach((selectedCategory) => {
                    if (selectedCategory.Name === category.Name) {
                        return false;
                    }
                });
                return true;
            });

            this.busy = false;
        }, err => this.errorService.handle(err));
    }

    public filterCategories(tag: string) {
        this.filteredCategories = this.categories.filter((category) => {
            return category.Name.toLowerCase().indexOf(tag.toLowerCase()) > -1;
        });
    };

    public createAndSelectCategory(categoryName) {
        let category = new EmployeeCategory();
        category.Name = categoryName;
        this.selectCategory(category, -1);
    }

    public selectCategory(category, index) {
        this.employeeService.saveEmployeeCategory(this.selectedEmployee.ID, category)
        .subscribe((res) => {
            this.selectedCategories.push(res);
            if (index > -1) {
                this.categories.splice(index, 1);
            }
            this.filteredCategories = this.categories;
        }, err => this.errorService.handle(err));
    }

    public removeCategory(category: EmployeeCategory, index: number) {
        this.employeeService.deleteEmployeeCategory(this.selectedEmployee.ID, category.ID).subscribe();
        this.selectedCategories.splice(index, 1);
    }
}
