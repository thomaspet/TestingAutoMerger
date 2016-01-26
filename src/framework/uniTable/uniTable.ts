import { Component, Input, AfterViewInit, ElementRef} from 'angular2/core';
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
    
	
	constructor(elementRef: ElementRef) {
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
					read: {
						url: this.config.resourceUrl,
                        type: 'GET',
						headers: httpHeaders
					},
                    update: {
                        url: (item) => {
                            return this.config.resourceUrl + '/' + item.ID
                        },
                        type: 'PUT',
                        headers: httpHeaders  
                    },
                    create: {
                        url: this.config.resourceUrl,
                        type: 'POST',
                        headers: httpHeaders  
                    },
                    destroy: {
                        url: (item) => {
                            return this.config.resourceUrl + '/' + item.ID
                        },
                        type: 'DELETE',
                        headers: httpHeaders
                    },
                    parameterMap: (options, operation) => {
                        console.log('hei');
                        console.log(operation);
                        console.log(options);                   
                        
                        if (operation === 'read') {
                            // return kendo.stringify(options);
                            return this.buildOdataString();
                        }
                        
                        if (operation !== "read" && options) {   
                            return kendo.stringify(options);
                        }
                    }
				},
				schema: { 
					model: this.config.dsModel,
                    total: "total"
				},
                pageSize: 10,
                serverPaging: true,
                serverFiltering: true,
			},
			toolbar: ["create", "save", "cancel"],
			columns: this.config.columns,
			filterable: true,
            editable: this.config.editable,
            navigatable: true,
            pageable: true,     
		};
		
		// If onSelect is defined we hook it up to the kendo change event which is fired when the user clicks a row
		if (this.config.onSelect && !this.config.editable) {
			this.tableConfig.selectable = "row";
			
			var vm = this;
			
			this.tableConfig.change = function(event: kendo.ui.GridChangeEvent) {
				var item = event.sender.dataItem(this.select());
				vm.config.onSelect(item);
			}
		}
        
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
        
        // Unbind kendo's keybind on numeric inputs so it doesn't interfere with up/down table navigation
        this.tableConfig.edit = (event) => {
            var input = jQuery(this.table.current()).find('.k-numerictextbox input').unbind('keydown');
        }
        
		// Compile kendo grid
        this.table = this.nativeElement.find('table').kendoGrid(this.tableConfig).data('kendoGrid');
        
        if (this.config.editable) {
            this.setupKeyNavigation();
        }
	}
    
    buildOdataString() {
        if (!this.config.odata) {
            return '';
        }
        
        var odataStr = '';
        odataStr += (this.config.odata.expand) ? ('expand=' + this.config.odata.expand + '&') : '';
        odataStr += (this.config.odata.select) ? ('select=' + this.config.odata.select + '&') : '';
        odataStr += (this.config.odata.filter) ? ('filter=' + this.config.odata.filter) : '';
        
        // // Remove trailing '&'
        if (odataStr[odataStr.length - 1] === '&') {
            odataStr = odataStr.slice(0, -1);
        }
        
        return odataStr;
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
	
}