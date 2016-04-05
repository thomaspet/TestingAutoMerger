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
                <li *ngFor="#category of categories">{{category.Name}} <button class="remove" (click)="removeTag(category)">Remove</button></li>
            </ul>

            <button class="poster_tags_addBtn" (click)="addingTags = !addingTags" [ngClass]="{'-is-active': addingTags}">Legg til&hellip;</button>
            <div class="poster_tags_addDropdown" [ngClass]="{'-is-active': addingTags}">

                <input type="text" placeholder="Søk kategorierier…" [(ngModel)]="newTag" (keyup)="presentResults(newTag)" autofocus/>

                <ul (click)="addingTags = false; newTag = ''" *ngIf="newTag">
                    <li *ngFor="#result of results" (click)="addTag(result)">{{result}}</li>
                    <li class="poster_tags_addNew" (click)="addTag(newTag)">Legg til <strong>‘{{newTag}}’</strong>…</li>
                </ul>
            </div>

        </section>
        
        
        <article class="buttonlist_component">
            <ul class="filter_buttonlist">
                <li *ngFor="#category of categories">
                    <button (click)="removeCategory(category)">{{category.Name}}</button>
                </li>
            </ul>
            <button (click)="addCategories()">Legg til</button>
            <button (click)="saveCategories()">Lagre</button>
            <select id="tags"></select>
            <input id="selectedCategories">
        </article>
    `
})

export class EmployeeCategoryButtons implements OnInit {
    private categories: Array<EmployeeCategory>;
    @Input()
    private selectedEmployee: Employee;
    private categoriesFromEmployee: Array<EmployeeCategoryLink>;
    //private multiselect: any;
    
    //private newItemText: any;
    
    constructor(private employeeService: EmployeeService, 
                private employeeCategoryService: EmployeeCategoryService) {
        
    }
    
    // http://docs.telerik.com/kendo-ui/api/javascript/ui/multiselect
    // http://jsfiddle.net/OnaBai/LQx2z/
    // http://stackoverflow.com/questions/16113029/how-to-set-data-values-on-kendo-multi-select
    // http://dojo.telerik.com/@diondirza/esEqo/4
    // http://output.jsbin.com/ucimay/7
    
    
    
    // public onDataBound(e: kendo.ui.MultiSelectDataBoundEvent) {
    //     // if (this.multiselection) {
    //         console.log('inside');
    //         if ((this.newItem || e.sender._prev) && 
    //         this.newItem !== e.sender._prev) {
    //             var ds = e.sender.dataSource,
    //                 datas = ds.data(),
    //                 lastItem = datas[datas.length - 1];

    //             this.newItem = e.sender._prev;

    //             if (/\(Add New\)$/i.test(lastItem.text)) {
    //                 ds.remove(lastItem);
    //             }
                
    //             var newEntryFound = e.sender._.findWhere(datas, 
    //             { ID: this.newItem }) !== null;

    //             if (this.newItem.length > 2 && !newEntryFound) {
    //             ds.add({ Name: this.newItem + ' (Lag ny)', ID: this.newItem });
    //             e.sender.open();
    //             }
    //         }
    //     // }
    // }
    
    // public onSelect(e: kendo.ui.MultiSelectEvent) {
    //     // e.sender.dataSource.view()[e.sender.]
    //     var dataItem = e.sender.dataSource.view()[e.item.index],
    //         datas = e.sender.dataSource.data(),
    //         lastData = datas[datas.length - 1];
        
    //     if (parseInt(dataItem.value) > 0) {
    //         e.sender.dataSource.remove(lastData);
    //     } else {
    //         dataItem.Name = dataItem.Name.replace(' (Lag ny)', '');
    //     }
    // }
    
    private setCategories() {
        // this.selectedEmployee.EmployeeCategoryLinks.forEach(categoryLinkID => {
        //     var cat = new EmployeeCategory();
        //     console.log('kategorilink', categoryLinkID);
        //     cat.EmployeeCategoryLinkID = categoryLinkID.EmployeeCategoryID;
        // });
        
        // this.categoriesFromEmployee = this.selectedEmployee.EmployeeCategoryLinks;
    }
    
    public ngOnInit() {
        var tags = [
            { text: "Tag1", value:"Tag1" },
            { text: "Tag2", value:"Tag2" },
            { text: "Tag3", value:"Tag3" }
        ];

        // this.setCategories();
		
        var newitemtext;
        
        var multiselect = jQuery('#tags').kendoMultiSelect({
			// change: function() {
			// 	var value = this.value().slice(0);
			// 	var dataitems = this.dataSource.data();

			// 	var newtag = "";

			// 	for (var i = 0; i < dataitems.length; i++) {
			// 	    var dataItem = dataitems[i];

			// 		if(dataItem.text.substring(0, "Add new tag: ".length) === "Add new tag: ") {
			// 			newtag = dataItem.text.replace("Add new tag: ", "");
			// 			this.dataSource.remove(dataItem);
			// 		}
			// 	}

			// 	this.dataSource.add({value: newtag, text: newtag});

            //   if (newtag) {
            //     this.dataSource.filter({});
			// 	if(this.value().length == 1)
			// 	{
			// 		this.value(newtag);
			// 	}
			// 	else
			// 	{
            //         value.push(newtag);
            //         console.log(value);
			// 		this.value(value);
			// 	}
            //   }
			// },
			// dataBound: function() {
			// 	if((newitemtext || this._prev) && newitemtext != this._prev)
			// 	{
			// 		newitemtext = this._prev;

			// 		var dataitems = this.dataSource.data();

			// 		var isfound = false;
			// 		for (var i = 0; i < dataitems.length; i++) {
			// 		    var dataItem = dataitems[i];

			// 			if(dataItem.value != dataItem.text) {
			// 				dataItem.text = "Add new tag: " + newitemtext;
			// 				this.refresh();
			// 				isfound = true;
			// 			}
			// 		}
			// 		if(!isfound)
			// 		{
			// 			this.dataSource.add({text: "Add new tag: " + newitemtext, value: newitemtext});
			// 			this.refresh();
			// 		}
			// 		this.search();
			// 		this.open();
			// 	}
			// },
			dataSource: tags,
			dataTextField: 'text',
			dataValueField: 'value',
			filter: 'contains',
			animation: false
		});
        
        console.log('multiselect', multiselect);
        // multiselect.dataSource.filter({});
        // multiselect.value = ('Tag1', 'Tag3');
        // multiselect.trigger('change');
        
        
        
        this.employeeService.getEmployeeCategories(this.selectedEmployee.EmployeeNumber)
        .subscribe((response: any) => {
            this.categories = response;
            console.log('response kategorier', response);
            
            this.selectedEmployee.EmployeeCategories = response;
            
            var data: any = [
                { text : 'name1', value : 'name1' },
                { text : 'name2', value : 'name2' },
                { text : 'name3', value : 'name3' },
                { text : 'name4', value : 'name4' },
                { text : 'name5', value : 'name5' },
                { text : 'name6', value : 'name6' }
            ];
            
            var newItemText;
            
            var multiselect2 = jQuery('#selectedCategories').kendoMultiSelect({
                animation: false,
                dataSource: data,
                // dataSource: this.data,
                dataTextField: 'text',
                dataValueField: 'value',
                placeholder: 'Legg til',
                filter: 'contains',
                // dataBound: (event) => this.onDataBound(event),
                
                // select: this.onSelect,
                // change: function() {
                //     // var dataItem = this.dataSource.view()[event.item.index()],
                //     // datas = this.dataSource.data(),
                //     // lastData = datas[datas.length - 1];
                    
                //     var dataitems = this.dataSource.data();
                    
                //     for (var i = 0; i < dataitems.length; i++) {
                //         var dataItem = dataitems[i];
                        
                //         console.log('dataItem', dataItem);
                        
                //         if (parseInt(dataItem.value) > 0) {
                //             this.dataSource.remove(dataItem);            
                //         } else {
                //             dataItem.text = dataItem.text.replace('Legg til ny: ', '');
                //         }
                //     }
                    
                //     console.log('dataSource', this.dataSource.data());
                // },
                change: function() {
                    var value = this.value().slice(0);
                    console.log('value', value);
                    
                    var dataitems = this.dataSource.data();

                    var newtag = '';

                    for (var i = 0; i < dataitems.length; i++) {
                        var dataItem = dataitems[i];
                        console.log('dataitem', dataItem);
                        if (dataItem.text.substring(0, 'Legg til ny: '.length) === 'Legg til ny: ') {
                            
                            newtag = dataItem.text.replace('Legg til ny: ', '');
                            console.log('newtag', newtag);
                            this.dataSource.remove(dataItem);
                        }
                    }

                    this.dataSource.add({value: newtag, text: newtag});

                    if (newtag) {
                        this.dataSource.filter({});
                        if (this.value().length === 1) {
                            this.value(newtag);
                        } else {
                            value.push(newtag);
                            console.log(value);
                            this.value(value);
                        }
                    }
                    
                    console.log('dataSource', this.dataSource.data());
                },
                dataBound: function() {
                    console.log('newItemText', newItemText);
                    if ((newItemText || this._prev) && newItemText !== this._prev) {
                        newItemText = this._prev;
                        console.log('this.prev', newItemText);

                        var dataitems = this.dataSource.data();

                        var isfound = false;
                        for (var i = 0; i < dataitems.length; i++) {
                            var dataItem = dataitems[i];
                            
                            console.log('dataItem for sjekk om likhet mellom value og text', dataItem);
                            if (dataItem.value !== dataItem.text) {
                                dataItem.text = 'Legg til ny: ' + newItemText;
                                this.refresh();
                                isfound = true;
                            }
                        }
                        if (!isfound) {
                            console.log('adds', newItemText);
                            this.dataSource.add({   text: 'Legg til ny: ' + newItemText, 
                                                    value: newItemText});
                            this.refresh();
                        }
                        this.search();
                        this.open();
                    }
                }
            }).data('kendoMultiSelect');
        });
    }
    
    public addCategories() {
        console.log('Add category');
    }
    
    public removeCategory(removeCategory: EmployeeCategory) {
        console.log('Remove category');
        var item: number = 0;
        this.selectedEmployee.EmployeeCategories.forEach(category => {
            if (category.Name === removeCategory.Name) {
                this.selectedEmployee.EmployeeCategories.splice(item, 1);
                // Here we must also delete categorylink on server
                // OR
                // we must flag categorylink to be deleted when employee is saved ?
            }
            item += 1;
        });
    }
    
    // lagrer kategorier basert på arrayen av kategorilinkID'er som ligg på den ansatte
    // ... dvs dersom det ligg linker i den arrayen - uvisst om den skal brukes no.
    // Avklaring på dette er rett rundt hjørnet (04.04.2016)
    public saveCategories() {
        this.employeeCategoryService.saveCategoriesOnEmployee(this.selectedEmployee);
    }
}
