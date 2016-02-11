import { Component, Input, AfterViewInit, ElementRef, OnDestroy} from 'angular2/core';
import {Http, Headers, URLSearchParams, Response} from 'angular2/http';
import {UniHttpService, UniHttpRequest} from '../data/uniHttpService';
import {NgIf} from 'angular2/common';
declare var jQuery;

enum DIRECTIONS { LEFT, RIGHT, UP, DOWN };

@Component({
	selector: 'uni-table',
	templateUrl: 'framework/uniTable/uniTable.html',
	directives: [NgIf]
})
export class UniTable implements AfterViewInit {	
	@Input() config;
	tableConfig: kendo.ui.GridOptions = {};
	
	filterString: string = "";
    nativeElement: any;
    table: kendo.ui.Grid;
    
    totalRows: number; // used for pagination
    
	
	constructor(private http: Http, elementRef: ElementRef, private uniHttp: UniHttpService) {
        this.nativeElement = jQuery(elementRef.nativeElement);
    }

	ngAfterViewInit() {            
        var httpHeaders = {
            'Client': 'client1'
        }
        
		// Create kendo options from the config
		this.tableConfig = {
			dataSource: {
				type: 'json',
				transport: {
                    // Read defined as a function instead of using kendo so we can get the number of rows from response headers
                    read: (options) => {
                        var urlParams = jQuery.extend({}, this.config.odata, options.data);
                        var searchMap = new URLSearchParams();
                        
                        Object.keys(urlParams).forEach((key) => {
                           if (urlParams[key]) {
                               if (key === 'take') {
                                   searchMap.append('top', urlParams[key]);
                               } else {
                                   searchMap.append(key, urlParams[key]);    
                               }
                           } 
                        });
                        
                        this.http.get(
                            this.config.resourceUrl,
                            {
                                headers: new Headers({'Client': 'client1'}),
                                search: searchMap
                            }
                        )
                        .subscribe((response) => {
                            var data = response.json();
                            this.totalRows = parseInt(response.headers.get('Total')) || data.length;
                            options.success(data)
                        });
                    },
                    
                    update: (options) => {
                        // options.data
                        var url = 'products/' + options.data.ID;
                        
                        this.uniHttp.put({
                            resource: url,
                            body: options.data
                        }).subscribe(
                            (response) => {
                                options.success(response);
                            },
                            (error) => {
                                options.error(error);
                            }
                        );
                    },
                    
                    create: (options) => {
                        this.uniHttp.post({
                            resource: 'products',
                            body: options.data
                        }).subscribe(
                            (response) => {
                                options.success(response);
                            },
                            (error) => {
                                options.error(error);
                            }
                        );
                    },
                    
                    destroy: (options) => {
                        this.uniHttp.delete({
                            resource: 'products/' + options.data.ID 
                        }).subscribe(
                            (response) => {
                                options.success(response);
                            },
                            (error) => {
                                options.error(error);
                            }
                        );
                    },

                    parameterMap: (options, operation) => {
                        if (operation === 'read') {
                            return jQuery.extend({}, this.config.odata, options);
                        }
                    }
				},
				schema: { 
					model: this.config.dsModel,
                    total: (response) => {
                        return this.totalRows;
                    }
				},
                pageSize: 0,//5,//this.config.pageSize || 10,
                serverPaging: true,
                serverFiltering: true,
			},
			columns: this.config.columns,
			filterable: true,
            editable: this.config.editable,
            navigatable: true,
            //pageable: true,    
		};
		       
		
        
        if (this.config.editable) {
            this.setupEditableTable();
        } else {
            this.setupReadOnlyTable();
        }
	}
    
    // Settings specific to read-only uniTable
    setupReadOnlyTable() {
        
        if (this.config.onSelect) {
            this.tableConfig.selectable = "row";
            
            var vm = this;
            this.tableConfig.change = function(event: kendo.ui.GridChangeEvent) {
                vm.config.onSelect(event.sender.dataItem(this.select()));
            }
        }
        
        // Compile kendo grid
        this.table = this.nativeElement.find('table').kendoGrid(this.tableConfig).data('kendoGrid');
    }
    
    // Settings specific to editable uniTable
    setupEditableTable() {
        this.tableConfig.toolbar = ["create", "save", "cancel"];
        
        // Add editable-cell class to the columns that are set to editable in the model
        this.tableConfig.columns.forEach((column) => {
            var modelField = this.tableConfig.dataSource.schema.model.fields[column.field];
            
            // check if the model field has editable = true or undefined (will be editable unless specified as false)
            if (modelField && (modelField.editable || modelField.editable === undefined)) {
                if (column.attributes) {
                    column.attributes.class = (column.attributes.class || '') + ' editable-cell'; 
                } else {
                    column.attributes = { "class": 'editable-cell' }
                }
            }
        });
        
        this.tableConfig.columns.push({
            command: ['destroy'], 
            title: '&nbsp;'
        })      
        
        
        
        // Compile kendo grid
        console.log(this.tableConfig);
        this.table = this.nativeElement.find('table').kendoGrid(this.tableConfig).data('kendoGrid');
        
        this.setupKeyNavigation();
    }
	
	filterTable() {
		var filterValue = this.filterString;
		var filter = '';
        
		var fields = this.tableConfig.dataSource.schema.model.fields;
		for (var fieldName of Object.keys(fields)) {
			let field = fields[fieldName];
            
            // Contains filter for text columns
			if (field.type === 'text') {
				filter += ' or contains(' + fieldName + ',\'' + filterValue + '\')';
			}
			
			// Eq filter for number columns
			if (field.type === 'number' && !isNaN(parseInt(filterValue)) ) {
				filter += ' or ' + fieldName + ' eq ' + filterValue;
			}
		}
        
        // Remove leading ' or '
        if (filter.indexOf(' or ') === 0) {
            filter = filter.slice(4);
        }
        
        this.config.odata.filter = filter;
		this.table.dataSource.query({});
	}
    
    setupKeyNavigation() {
        // Unbind kendo's keybind on numeric inputs so it doesn't interfere with up/down table navigation
        this.tableConfig.edit = (event) => {
            var input = jQuery(this.table.current()).find('.k-numerictextbox input').unbind('keydown');
        }
        
        jQuery(this.table.table).keyup((event) => {
            // Enter
            if (event.keyCode === 13) {
                if (event.shiftKey) {
                    this.move(DIRECTIONS.LEFT);
                } else {
                    this.move(DIRECTIONS.RIGHT);    
                }
            }
                        
            // Up arrow
            if (event.ctrlKey && event.keyCode === 38) {
                event.preventDefault();
                this.move(DIRECTIONS.UP);
            }
            
            // Down arrow
            if (event.ctrlKey && event.keyCode === 40) {
                event.preventDefault();
                this.move(DIRECTIONS.DOWN);
            }
                        
        });
    }
    
    move(direction) {
        var currentCell = jQuery(this.table.current());
        var newCell; 

        switch(direction) {
            case DIRECTIONS.LEFT:
                newCell = currentCell.prevAll('.editable-cell');
                if (!newCell[0]) {  
                    newCell = currentCell.parent('tr').prev().children('.editable-cell:last');
                }
            break;
            
            case DIRECTIONS.RIGHT:
                newCell = currentCell.nextAll('.editable-cell');
                if (!newCell[0]) {
                    newCell = currentCell.parent('tr').next().children('.editable-cell:first');
                }
            break;
            
            case DIRECTIONS.UP:
                var prevRow = currentCell.parent('tr').prev('tr');
                var newCell = jQuery('td:eq(' + currentCell.index() + ')', prevRow);
            break;
            
            case DIRECTIONS.DOWN:
                var nextRow = currentCell.parent('tr').next('tr');
                var newCell = jQuery('td:eq(' + currentCell.index() + ')', nextRow);
            break;
        }
                
        if (newCell.length > 0) {
            currentCell.find('input').blur(); // makes sure any changes are updated (in browser, no http call here) before moving focus
            this.table.current(newCell);
            this.table.editCell(newCell);
        }
    }
    
    // Avoid duplicate uniTable when renavigating
    ngOnDestroy() {
        this.nativeElement.find('.k-grid').remove();
        this.nativeElement.append('<table></table>');
    }
	
}