import {Component, Input, OnInit, OnChanges} from '@angular/core';
import {EmployeeCategory} from '../../../unientities';
import {EmployeeService, EmployeeCategoryService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';

declare var jQuery;

@Component({
    selector: 'employeecategory-buttons',
    providers: [EmployeeService, EmployeeCategoryService],
    template: `
        <section class="poster_tags" [attr.aria-busy]="busy">

            <ul class="poster_tags_list">
                <li *ngFor="let category of selectedEmployee.EmployeeCategories">{{category.Name}}
                <button class="remove" (click)="removeCategory(category)">Remove</button></li>
            </ul>

            <button class="poster_tags_addBtn" (click)="addingTags = !addingTags" [ngClass]="{'-is-active': addingTags}">Legg til kategori&hellip;</button>
            <div class="poster_tags_addDropdown" [ngClass]="{'-is-active': addingTags}">

                <input type="text" placeholder="Søk kategorierier…"
                [(ngModel)]="newTag" (keyup)="presentResults(newTag)" autofocus/>

                <ul (click)="addingTags = false; newTag = ''" *ngIf="newTag">
                    <li *ngFor="let result of results" (click)="saveCategory(result)">{{result.Name}}</li>
                    <li class="poster_tags_addNew" (click)="saveAndAddNewCategory(newTag)">
                    Legg til <strong>‘{{newTag}}’</strong>…</li>
                </ul>
            </div>

        </section>
    `
})

export class EmployeeCategoryButtons implements OnInit, OnChanges{
    public busy: boolean;
    private categories: Array<EmployeeCategory>;
    private results: Array<EmployeeCategory> = [];
    @Input()
    private selectedEmployee: any;

    constructor(private employeeService: EmployeeService,
                private employeeCategoryService: EmployeeCategoryService) {

    }

    private filterTags(tag: string) {
        let containsString = (str: EmployeeCategory) => {
            return str.Name.toLowerCase().indexOf(tag.toLowerCase()) >= 0;
        };

        return this.categories.filter(containsString);
    };

    public presentResults(tag: string) {
        this.results = this.filterTags(tag).splice(0, 5);
    };

    public ngOnInit() {
        this.refreshCategories();
    }

    public ngOnChanges() {
        this.refreshCategories();
    }

    private refreshCategories() {
        this.busy = true;
        Observable.forkJoin(
            this.employeeService.getEmployeeCategories(this.selectedEmployee.ID),
            this.employeeCategoryService.GetAll('')
        )
        .subscribe((response: any) => {
            let [empCategories, allCategories] = response;
            this.selectedEmployee.EmployeeCategories = empCategories ? empCategories : [];
            this.categories = allCategories;

            // remove selected categories from available categories
            if (this.categories.length > 0) {
                let arrLength = this.selectedEmployee.EmployeeCategories ? this.selectedEmployee.EmployeeCategories.length : 0;
                for (var selIndx = 0; selIndx < arrLength; selIndx++) {
                    let selCat = this.selectedEmployee.EmployeeCategories[selIndx];
                    for (var avIndx = this.categories.length - 1; avIndx >= 0; avIndx--) {
                        let avCat = this.categories[avIndx];
                        if (avCat.Name === selCat.Name) {
                            this.categories.splice(avIndx, 1);
                        }
                    }
                }
            }
            this.busy = false;
        });
    }
    

    public saveAndAddNewCategory(categoryName) {
        
        let cat = new EmployeeCategory();
        cat.Name = categoryName;
        this.saveCategory(cat);
    }

    public removeCategory(removeCategory: EmployeeCategory) {
        this.employeeService.deleteEmployeeCategory(this.selectedEmployee.ID, removeCategory.ID).subscribe();
        this.selectedEmployee.EmployeeCategories.splice(this.selectedEmployee.EmployeeCategories.indexOf(removeCategory), 1);
        this.categories.push(removeCategory);
    }

    public saveCategory(category) {
        this.employeeService.saveEmployeeCategory(this.selectedEmployee.ID, category).subscribe((response: EmployeeCategory) => {
            this.addCategory(response);
        });
    }

    public addCategory(category: EmployeeCategory) {

        this.selectedEmployee.EmployeeCategories.push(category);

        let indx = this.categories.map((e) => {
            return e.Name;
        }).indexOf(category.Name);
        if (indx > -1) {
            this.categories.splice(indx, 1);
        }

        return category;
    }
}
