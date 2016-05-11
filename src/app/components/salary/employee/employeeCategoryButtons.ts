import {Component, Input, OnInit} from '@angular/core';
import {EmployeeCategory} from '../../../unientities';
import {EmployeeService, EmployeeCategoryService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';

declare var jQuery;

@Component({
    selector: 'employeecategory-buttons',
    providers: [EmployeeService, EmployeeCategoryService],
    template: `
        <section class="poster_tags">

            <ul class="poster_tags_list">
                <li *ngFor="let category of selectedEmployee.EmployeeCategories">{{category.Name}} 
                <button class="remove" (click)="removeCategory(category)">Remove</button></li>
            </ul>

            <button class="poster_tags_addBtn" (click)="addingTags = !addingTags" [ngClass]="{'-is-active': addingTags}">Legg til&hellip;</button>
            <div class="poster_tags_addDropdown" [ngClass]="{'-is-active': addingTags}">

                <input type="text" placeholder="Søk kategorierier…" 
                [(ngModel)]="newTag" (keyup)="presentResults(newTag)" autofocus/>

                <ul (click)="addingTags = false; newTag = ''" *ngIf="newTag">
                    <li *ngFor="let result of results" (click)="addCategory(result.Name)">{{result.Name}}</li>
                    <li class="poster_tags_addNew" (click)="addCategoryAndSave(newTag)">
                    Legg til <strong>‘{{newTag}}’</strong>…</li>
                </ul>
            </div>

        </section>
    `
})

export class EmployeeCategoryButtons implements OnInit {
    private categories: Array<EmployeeCategory>;
    private results: Array<EmployeeCategory> = [];
    @Input()
    private selectedEmployee: any;
    
    constructor(private employeeService: EmployeeService, 
                private employeeCategoryService: EmployeeCategoryService) {
        
        // this.employeeCategoryService.GetAll('')
        // .subscribe((response: any) => {
        //     this.categories = response;
        // });
    }
    
    private filterTags(tag: string) {
        let containsString = function(str: EmployeeCategory) {
            return str.Name.toLowerCase().indexOf(tag.toLowerCase()) >= 0;
        };

        return this.categories.filter(containsString);
    };

    private presentResults(tag: string) {
        this.results = this.filterTags(tag).splice(0, 5);
    };
    
    public ngOnInit() {
        Observable.forkJoin(
            this.employeeService.getEmployeeCategories(this.selectedEmployee.EmployeeNumber),
            this.employeeCategoryService.GetAll('')
        )
        .subscribe((response: any) => {
            var [empCategories, allCategories] = response;
            this.selectedEmployee.EmployeeCategories = empCategories ? empCategories : [];
            this.categories = allCategories;
            
            // remove selected categories from available categories
            if (this.categories.length > 0) {
                var arrLength = this.selectedEmployee.EmployeeCategories ? this.selectedEmployee.EmployeeCategories.length : 0;
                for (var selIndx = 0; selIndx < arrLength; selIndx++) {
                    var selCat = this.selectedEmployee.EmployeeCategories[selIndx];
                    for (var avIndx = this.categories.length - 1; avIndx >= 0; avIndx--) {
                        var avCat = this.categories[avIndx];
                        if (avCat.Name === selCat.Name) {
                            this.categories.splice(avIndx, 1);
                        }
                    }
                }
            }
        });
    }
    
    public addCategory(categoryName) {
        var category = new EmployeeCategory();
        category.Name = categoryName;
        
        this.selectedEmployee.EmployeeCategories.push(category);
        
        var indx = this.categories.map(function(e) {
            return e.Name;
        }).indexOf(categoryName);
        if (indx > -1) {
            this.categories.splice(indx, 1);
        }
        return category;
    }
    
    public addCategoryAndSave(categoryName) {
        var cat = this.addCategory(categoryName);
        this.saveCategory(cat);
    }
    
    public removeCategory(removeCategory: EmployeeCategory) {
        this.selectedEmployee.EmployeeCategories.splice(this.selectedEmployee.EmployeeCategories.indexOf(removeCategory), 1);
        this.categories.push(removeCategory);
    }
    
    public saveCategory(category) {
        this.employeeCategoryService.saveCategory(category)
        .subscribe(response => {
            
        });
    }
}
