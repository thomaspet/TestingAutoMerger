import {Component, Input, OnInit} from 'angular2/core';
import {EmployeeCategory, Employee} from '../../../unientities';
import {EmployeeService, EmployeeCategoryService} from '../../../services/services';

declare var jQuery;

@Component({
    selector: 'employeecategory-buttons',
    providers: [EmployeeService, EmployeeCategoryService],
    template: `
        <section class="poster_tags">

            <ul class="poster_tags_list">
                <li *ngFor="#category of selectedEmployee.EmployeeCategories">{{category.Name}} 
                <button class="remove" (click)="removeCategory(category)">Remove</button></li>
            </ul>

            <button class="poster_tags_addBtn" (click)="addingTags = !addingTags" [ngClass]="{'-is-active': addingTags}">Legg til&hellip;</button>
            <div class="poster_tags_addDropdown" [ngClass]="{'-is-active': addingTags}">

                <input type="text" placeholder="Søk kategorierier…" 
                [(ngModel)]="newTag" (keyup)="presentResults(newTag)" autofocus/>

                <ul (click)="addingTags = false; newTag = ''" *ngIf="newTag">
                    <li *ngFor="#result of results" (click)="addCategory(result.Name)">{{result.Name}}</li>
                    <li class="poster_tags_addNew" (click)="addCategory(newTag)">
                    Legg til <strong>‘{{newTag}}’</strong>…</li>
                </ul>
            </div>

        </section>
        
        
        <article class="buttonlist_component">
            <ul class="filter_buttonlist">
                <li *ngFor="#category of categories">
                    <button (click)="removeCategory(category)">{{category.Name}}</button>
                </li>
            </ul>
            <!--<button (click)="addCategories()">Legg til</button>
            <button (click)="saveCategories()">Lagre</button>
            <select id="tags"></select>
            <input id="selectedCategories">-->
        </article>
    `
})

export class EmployeeCategoryButtons implements OnInit {
    private categories: Array<EmployeeCategory>;
    private results: Array<EmployeeCategory> = [];
    @Input()
    private selectedEmployee: Employee;
    
    constructor(private employeeService: EmployeeService, 
                private employeeCategoryService: EmployeeCategoryService) {
        
        this.employeeCategoryService.GetAll('')
        .subscribe((response: any) => {
            this.categories = response;
        });
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
        this.employeeService.getEmployeeCategories(this.selectedEmployee.EmployeeNumber)
        .subscribe((response: any) => {
            this.selectedEmployee.EmployeeCategories = response;
            
            // remove selected categories from available categories
            var arrLength = this.selectedEmployee.EmployeeCategories.length;
            for (var selIndx = 0; selIndx < arrLength; selIndx++) {
                var selCat = this.selectedEmployee.EmployeeCategories[selIndx];
                for (var avIndx = this.categories.length - 1; avIndx >= 0; avIndx--) {
                    var avCat = this.categories[avIndx];
                    if (avCat.Name === selCat.Name) {
                        this.categories.splice(avIndx, 1);
                    }
                }
            }
        });
    }
    
    public addCategory(categoryName) {
        console.log('Add category', categoryName);
        console.log('categories', this.categories);
        console.log('indexOf', this.categories.indexOf(categoryName));
        
        var category = new EmployeeCategory();
        category.Name = categoryName;
        
        this.selectedEmployee.EmployeeCategories.push(category);
        
        var indx = this.categories.map(function(e) {
            return e.Name;
        }).indexOf(categoryName);
        
        this.categories.splice(indx, 1);
        
    }
    
    public removeCategory(removeCategory: EmployeeCategory) {
        console.log('Remove category');
        console.log('removed at index', this.selectedEmployee.EmployeeCategories.indexOf(removeCategory));
        this.selectedEmployee.EmployeeCategories.splice(this.selectedEmployee.EmployeeCategories.indexOf(removeCategory), 1);
        this.categories.unshift(removeCategory);
        
        // var item: number = 0;
        // this.selectedEmployee.EmployeeCategories.forEach(category => {
        //     if (category.Name === removeCategory.Name) {
        //         this.selectedEmployee.EmployeeCategories.splice(item, 1);
        //         // Here we must also delete categorylink on server
        //         // OR
        //         // we must flag categorylink to be deleted when employee is saved ?
        //     }
        //     item += 1;
        // });
    }
    
    public saveCategories() {
        this.employeeCategoryService.saveCategoriesOnEmployee(this.selectedEmployee);
    }
}
