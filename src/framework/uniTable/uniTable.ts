import { Component, Input, AfterViewInit} from 'angular2/core';
import {NgIf} from 'angular2/common';
declare var jQuery;

@Component({
	selector: 'uni-table',
	templateUrl: 'framework/uniTable/uniTable.html',
	directives: [NgIf]
})
export class UniTable implements AfterViewInit {	
	@Input() config;
	tableConfig: kendo.ui.GridOptions = {};
	
	filterString: string = "";
	tableID: string;
	table: kendo.ui.Grid;
	
	constructor() { 
		// Generate a unique ID for the table
		this.tableID = "uni-table-" + Date.now();
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
						url: this.config.resourceUrl + this.buildOdataString(),
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
                    parameterMap: function(options, operation) {
                        if (operation !== "read" && options) {   
                            return kendo.stringify(options);
                        }
                    }
				},
				schema: { 
					model: this.config.dsModel
				},
                pageSize: 20,
			},
			toolbar: ["create", "save", "cancel"],
			columns: this.config.columns,
			filterable: true,
            editable: this.config.editable,
            navigatable: true,            
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
            var input = this.table.current().find('.k-numerictextbox input').unbind('keydown');
        }
        
		// Compile kendo grid
		var element: any = $('#' + this.tableID);
		element.kendoGrid(this.tableConfig);
		
		this.table = element.data('kendoGrid');
        
        this.setupKeyNavigation();
	}
    
    buildOdataString() {
        if (!this.config.odata) {
            return '';
        }
        
        var odataStr = '?';
        odataStr += (this.config.odata.expand) ? ('expand=' + this.config.odata.expand + '&') : '';
        odataStr += (this.config.odata.select) ? ('select=' + this.config.odata.select + '&') : '';
        odataStr += (this.config.odata.filter) ? ('filter=' + this.config.odata.filter) : '';
        
        // Remove trailing '&'
        if (odataStr[odataStr.length - 1] === '&') {
            odataStr = odataStr.slice(0, -1);
        }
        
        // If length is 1 ("?") it means there is no odata in the config
        if (odataStr.length === 1) {
            return ''
        }
        
        return odataStr;
    }
	
	filterTable() {
		var val = this.filterString;
		var filter = { logic: 'or', filters: [] };
		
		var fields = this.tableConfig.dataSource.schema.model.fields;
		for (var fieldName of Object.keys(fields)) {
			let field = fields[fieldName];
					
			// Contains filter for text columns
			if (field.type === 'text') {
				filter.filters.push({
					field: fieldName,
					operator: 'contains',
					value: val
				});
			}
			
			// Eq filter for number columns
			if (field.type === 'number' && !isNaN(<any> val) ) {
				filter.filters.push({
					field: fieldName,
					operator: 'eq',
					value: parseInt(val)
				});
			}
		}
		
		this.table.dataSource.query({filter: filter});
	}
    
    setupKeyNavigation() {
        var table = jQuery('#' + this.tableID);        
        
        jQuery(table).keydown((event) => {
            // Enter
            if (event.keyCode === 13) {
                event.preventDefault();
                if (event.shiftKey) {
                    this.move('RIGHT');
                } else {
                    this.move('LEFT');    
                }
            }
                        
            // Up arrow
            if (event.ctrlKey && event.keyCode === 38) {
                event.preventDefault();
                this.move('UP');
            }
            
            // Down arrow
            if (event.ctrlKey && event.keyCode === 40) {
                event.preventDefault();
                this.move('DOWN');
            }
            
            /* Keyboard left/right are disabled for now as their shortcuts breaks native support for marking text */
            // if (event.ctrlKey && event.keyCode === 37) {
            //     this.move('LEFT');
            // }            
            // if (event.ctrlKey && event.keyCode === 39) {
            //     this.move('RIGHT')
            // }
            
        });
    }
    
    move(direction) {
        var table = jQuery('#' + this.tableID);
        var currentCell = table.find('.k-edit-cell');
        var newCell;
        
        switch(direction) {
            case 'LEFT':
                newCell = currentCell.prevAll('.editable-cell');
                if (!newCell[0]) {  
                    newCell = currentCell.parent('tr').prev().children('.editable-cell:last');
                }
            break;
            
            case 'RIGHT':
                newCell = currentCell.nextAll('.editable-cell');
                if (!newCell[0]) {
                    newCell = currentCell.parent('tr').next().children('.editable-cell:first');
                }
            break;
            
            case 'UP':
                var prevRow = currentCell.parent('tr').prev('tr');
                var newCell = jQuery('td:eq(' + currentCell.index() + ')', prevRow);
            break;
            
            case 'DOWN':
                var nextRow = currentCell.parent('tr').next('tr');
                var newCell = jQuery('td:eq(' + currentCell.index() + ')', nextRow);
            break;
        }
                
        if (newCell.length > 0) {
            currentCell.find('input').blur(); // makes sure any changes in the input field are stored before moving
            this.table.current(newCell);
            this.table.editCell(newCell);
        }
    }
	
}