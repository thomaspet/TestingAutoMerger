import { Component, Input, AfterViewInit} from 'angular2/core';
import {NgIf} from 'angular2/common';

@Component({
	selector: 'uni-table',
	templateUrl: 'framework/uniTable/uniTable.html',
	directives: [NgIf]
})
export class UniTable implements AfterViewInit {	
	@Input() config;
	kOptions: kendo.ui.GridOptions = {};
	
	filterString: string = "";
	tableID: string;
	table: kendo.ui.Grid;
	
	constructor() { 
		// Generate a unique ID for the table
		this.tableID = "uni-table-" + Date.now();
	}

	ngAfterViewInit() {	
		// Create kendo options from the config
		this.kOptions = {
			dataSource: {
				type: 'json',
				transport: {
					read: {
						url: this.config.lookupUrl,
						type: 'GET',
						headers: {
							'Client': 'client1'
						}
					}
				},
				schema: { 
					model: {
						id: 'ID',
						fields: this.config.fields		
					}
				}
			},
			
			columns: this.config.columns,
			filterable: true
		};
		
		// If onSelect is defined we hook it up to the kendo change event which is fired when the user clicks a row
		if (this.config.onSelect) {
			this.kOptions.selectable = "row";
			
			var vm = this;
			
			this.kOptions.change = function(event: kendo.ui.GridChangeEvent) {
				var item = event.sender.dataItem(this.select());
				vm.config.onSelect(item);
			}
		}
		
		// Compile kendo grid
		var element: any = $('#' + this.tableID);
		element.kendoGrid(this.kOptions);
		
		this.table = element.data('kendoGrid');
	}
	
	filterTable() {
		var val = this.filterString;
		var filter = { logic: 'or', filters: [] };
		
		var fields = this.kOptions.dataSource.schema.model.fields;
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