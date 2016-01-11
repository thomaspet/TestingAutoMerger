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
		
		// Compile kendo grid
		var element: any = $('#' + this.tableID);
		element.kendoGrid(this.tableConfig);
		
		this.table = element.data('kendoGrid');
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
	
}