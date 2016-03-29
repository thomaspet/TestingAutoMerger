import {Component, Input, OnInit} from 'angular2/core';
import {EmployeeCategory} from '../../../unientities';
import {EmployeeService} from '../../../services/services';

@Component({
    selector: 'employeecategory-buttons',
    providers: [EmployeeService],
    template: `
        <article class="buttonlist_component">
            <ul class="filter_buttonlist">
                <li *ngFor="#category of categories">
                    <button (click)="removeCategory(category)">{{category.Name}}</button>
                </li>
            </ul>
            <button (click)="openCategories()">Legg til</button>
        </article>
    `
})

export class EmployeeCategoryButtons implements OnInit {
    private categories: Array<EmployeeCategory>;
    @Input()
    private employeeID: number;
    
    constructor(private employeeService: EmployeeService) {
        
    }
    
    public ngOnInit() {
        this.employeeService.getEmployeeCategories(this.employeeID)
        .subscribe((response: any) => {
            this.categories = response;
        });
    }
    
    public openCategories() {
        console.log('Add category');
    }
    
    public removeCategory(category: EmployeeCategory) {
        console.log('Remove category');
     }
    
}
