import {
	Component,
	View,
	Input,
	NgIf,
	NgFor,
	NgClass,
	ControlGroup, 
	Control,
	AfterViewInit,
	FORM_DIRECTIVES,
} from 'angular2/core';

export interface IGridConfig {
	searchable?: boolean,
	editable?: boolean,
	onSelect?: (selectedRow?) => any,
	gridButtons?: [{
		title: string,
		classes?: string,
		iconClasses?: string,
		onClick: Function
	}],
	kOptions: kendo.ui.GridOptions
}

@Component({
	selector: 'uni-grid',
	templateUrl: 'framework/uni-grid/uni-grid.html',
	directives: [NgIf, NgFor, NgClass]
})
export class UniGridComponent {	
	@Input() config: IGridConfig;
	
	filterString: string = "";
	gridID: string;
	grid: kendo.ui.Grid;
	
	constructor() { 
		// Generate unique ID for the grid
		this.gridID = "uni-grid-" + Date.now();
	}
	
	afterViewInit() {
		var config = this.config;
		
		if (config.onSelect) {
			config.kOptions.selectable = "row";
			
			// change event is fired when the user clicks a row in the grid
			config.kOptions.change = function(event: kendo.ui.GridChangeEvent) {
				var item = event.sender.dataItem(this.select());
				config.onSelect(item);
			}
		}
		
		var element: any = $('#' + this.gridID);
		element.kendoGrid(config.kOptions);
		
		this.grid = element.data('kendoGrid');
	}
	
	filterGrid() {
		var val = this.filterString;
		
		var filter = { logic: 'or', filters: [] };
		this.grid.columns.forEach(function(column) {
			if (column.filterable) {
				filter.filters.push({
					field: column.field,
					operator: 'contains',
					value: val
				})
			}
		});
		
		this.grid.dataSource.query({filter: filter});
	}
} 

// export interface IGridColumn {
// 	field: string,
// 	title: string,
// 	type: string,
// 	format?: string,
// 	editable?: boolean,
// 	nullable?: boolean,
// 	validation?: Object
// }
// 
// export interface IGridButton {
// 	title: string,
// 	onClick: Function,
// 	classes?: string,
// 	iconClasses?: string
// }
// 
// export class UniGrid {
// 	gridConfig: IGridConfig;
// 		
// 	constructor(lookupUrl: string, editable: boolean = false, searchable: boolean = true) {
// 		this.gridConfig = {
// 			searchable: searchable,
// 			editable: editable,
// 			
// 			kOptions: {
// 				dataSource: new kendo.data.DataSource({
// 					type: 'json',
// 					transport: {
// 						read: {
// 							url: lookupUrl,
// 							type: 'GET',
// 							headers: {
// 								'Client': 'client1'
// 							}
// 						}
// 					},
// 					schema: {
// 						model: {
// 							id: 'randomID', // TODO: Generate unique ID
// 							fields: {
// 								// added in addColumn method
// 							}
// 						}
// 					}
// 				}),
// 				
// 				columns: []
// 			},
// 		};
// 		
// 	}	
// 	
// 	addColumn (field: string, title: string, type: string, editable?: boolean, nullable: boolean = true) {		
// 		var colEditable = (editable === undefined) ? this.gridConfig.kOptions.editable : editable;
// 		
// 		this.gridConfig.kOptions.dataSource.schema.fields[field] = {
// 			type: type,
// 			editable: colEditable, 
// 			nullable: nullable,
// 		}
// 		
// 		this.gridConfig.kOptions.columns.push({
// 			field: field,
// 			title: title,
// 		});
// 		
// 		console.log(this.gridConfig);
// 	}
// 	
// 	setOnSelect(onSelect) {
// 		this.gridConfig.onSelect = onSelect;
// 	}
// 	
// 	getConfig() {
// 		return {
// 			searchable: this.gridConfig.searchable,
// 			editable: this.gridConfig.editable,
// 			gridButtons: null, // TODO
// 			kOptions: this.gridConfig.kOptions
// 		}
// 	}
// 	
// }