import {Component, Input, OnInit} from 'angular2/core';
import {EmployeeCategory} from '../../../unientities';
import {EmployeeService} from '../../../services/services';

declare var jQuery;

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
            <button (click)="addCategories()">Legg til</button>
            <label>Kategorier</label>
            <input id="selectedCategories">
        </article>
    `
})

export class EmployeeCategoryButtons implements OnInit {
    private categories: Array<EmployeeCategory>;
    @Input()
    private employeeID: number;
    private multiselection: any;
    private data: any = [
        { name : 'name1', value : 'value1' },
        { name : 'name2', value : 'value2' },
        { name : 'name3', value : 'value3' },
        { name : 'name4', value : 'value4' },
        { name : 'name5', value : 'value5' },
        { name : 'name6', value : 'value6' }
    ];
    private newItem: any;
    
    constructor(private employeeService: EmployeeService) {
        
    }
    
    // http://dojo.telerik.com/@diondirza/esEqo/4
    // Her gjøres det vi vil ha.
    
    public onDataBound() {
        if (this.multiselection) {
            console.log('inside');
            if ((this.newItem || this.multiselection._prev) && 
            this.newItem !== this.multiselection._prev) {
                var ds = this.multiselection.dataSource,
                    datas = ds.data(),
                    lastItem = datas[datas.length - 1];

                this.newItem = this.multiselection._prev;

                if (/\(Add New\)$/i.test(lastItem.text)) {
                    ds.remove(lastItem);
                }
                
                var newEntryFound = this.multiselection._.findWhere(datas, 
                { ID: this.newItem }) !== null;

                if (this.newItem.length > 2 && !newEntryFound) {
                ds.add({ Name: this.newItem + ' (Lag ny)', ID: this.newItem });
                this.multiselection.open();
                }
            }
        }
    }
    
    public onSelect(e) {
        var dataItem = this.multiselection.dataSource.view()[e.item.index],
            datas = this.multiselection.dataSource.data(),
            lastData = datas[datas.length - 1];
        
        if (parseInt(dataItem.value) > 0) {
            this.multiselection.dataSource.remove(lastData);
        } else {
            dataItem.Name = dataItem.Name.replace(' (Lag ny)', '');
        }
    }
    
    public ngOnInit() {
        this.employeeService.getEmployeeCategories(this.employeeID)
        .subscribe((response: any) => {
            this.categories = response;
            console.log('response kategorier', response);
            // var empty = new EmployeeCategory();
            // empty.Name = 'Lagre denne';
            // Add item to response - if this is chosen lets POST it
            // this.categories[this.categories.length] = empty;
            
            this.multiselection = jQuery('#selectedCategories').kendoMultiSelect({
                animation: false,
                dataSource: this.categories,
                // dataSource: this.data,
                dataTextField: 'Name',
                dataValueField: 'ID',
                placeholder: 'Legg til',
                dataBound: this.onDataBound,
                select: this.onSelect
            }).data('kendoMultiSelect');
        });
    }
    
    public addCategories() {
        console.log('Add category');
    }
    
    public removeCategory(category: EmployeeCategory) {
        console.log('Remove category');
    }
}
