import {Component, Input, OnInit} from 'angular2/core';
import {EmployeeCategory, Employee, EmployeeCategoryLink} from '../../../unientities';
import {EmployeeService, EmployeeCategoryService} from '../../../services/services';

declare var jQuery;

@Component({
    selector: 'employeecategory-buttons',
    providers: [EmployeeService, EmployeeCategoryService],
    template: `
        <section class="poster_tags">

            <ul class="poster_tags_list">
                <li *ngFor="#category of selectedEmployee.EmployeeCategories">{{category.Name}} 
                <button class="remove" (click)="removeTag(category)">Remove</button></li>
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
    @Input()
    private selectedEmployee: Employee;
    
    constructor(private employeeService: EmployeeService, 
                private employeeCategoryService: EmployeeCategoryService) {
        
        this.employeeCategoryService.GetAll('')
        .subscribe((response: any) => {
            this.categories = response;
        });
    }
    
    public ngOnInit() {        
        this.employeeService.getEmployeeCategories(this.selectedEmployee.EmployeeNumber)
        .subscribe((response: any) => {
            this.selectedEmployee.EmployeeCategories = response;
        });
    }
    
    public addCategory(categoryName) {
        console.log('Add category', categoryName);
        console.log('categories', this.categories);
        
        var category = new EmployeeCategory();
        category.Name = categoryName;
        
        this.selectedEmployee.EmployeeCategories.push(category);
        this.categories.splice(this.categories.indexOf(categoryName), 1);
        
        console.log('categories', this.categories);
    }
    
    public removeCategory(removeCategory: EmployeeCategory) {
        console.log('Remove category');
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
    
    // private tags: string[] = ['Aktiv', 'Sjømenn', 'Pensjon'];

    private results: Array<EmployeeCategory> = [];
    
    private filterTags = function(tag: string) {
        let containsString = function(str: EmployeeCategory) {
            return str.Name.toLowerCase().indexOf(tag.toLowerCase()) >= 0;
        };

        return this.selectedEmployee.EmployeeCategories.filter(containsString);
    };

    private presentResults = function(tag: string){
        console.log('present result', tag);
        this.results = this.filterTags(tag).splice(0, 5);
    };

    // private addTag(tag) {
    //     this.tags.push(tag);
    //     this.availableTags.splice(this.availableTags.indexOf(tag), 1);
    // }

    // private removeTag(tag) {
    //     this.tags.splice(this.tags.indexOf(tag), 1);
    //     this.availableTags.unshift(tag);
    // }
}
