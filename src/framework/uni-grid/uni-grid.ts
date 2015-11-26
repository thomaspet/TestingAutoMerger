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

// export class GridConfig {
// 	AddButton(title, cls = "", iconCls = "", onClick){
// 		return new GridButton()
// 	}
// 	AddColumn(titiel, asdlhasdkma sd, msdlnasdf, type, required, visible = true){
// 		koptions.push()
// 		columns.Add()
// 	}
// 	
// 	GridConfig(): object{
// 		
// 	}
// }

export interface IGridColumn {
	field: string,
	title: string,
	type: string,
	format?: string,
	editable?: boolean,
	nullable?: boolean,
	validation?: Object
}

export interface IGridButton {
	title: string,
	onClick: Function,
	classes?: string,
	iconClasses?: string
}

export class UniGrid {
	searchable: boolean = false;
	editable: boolean = false;
	onSelect: (selectedRow) => any;
	gridButtons: IGridButton[];
	
	kOptions: kendo.ui.GridOptions = {};
	
	constructor(lookupUrl: string, editable: boolean = false) {
		this.kOptions.editable = editable;
		
		this.kOptions.dataSource = new kendo.data.DataSource({
			transport: {
				read: {
                    url: lookupUrl,
                    type: 'GET',
                    dataType: 'json'
                },
                create: {
                    url: lookupUrl,
                    type: 'POST',
                    dataType: 'json', 		          // The response content type
                    contentType: 'application/json',  // The request content type
                },
                update: {
                    url: function(e) {
						return lookupUrl + '/' + e.ID;
					},
                    type: 'PUT',
                    dataType: 'json',
                    contentType: 'application/json',
                },
                destroy: {
                    url: function(e) {
						return lookupUrl + '/' + e.ID;
					},
                    type: 'DELETE',
                    dataType: 'json'
                },
				
				parameterMap: function(options, operation) {
					if (operation !== "read" && options.models) {
                    	return {models: kendo.stringify(options.models)};
                    }
				}
			},
			pageSize: 20,
			schema: {
				model: {
					id: '',
					fields: {
						id: 'grid-model-' + Date.now(), // generate unique model identifier (kendo requires this)
						fields: {}
					}
				}
			}
			
			
		});
	}	
	
	addColumn (field: string, title: string, type: string, format?: string, editable?: boolean, nullable: boolean = true, validation?: Object) {		
		var colEditable = (editable === undefined) ? this.kOptions.editable : editable;
		
		this.kOptions.dataSource.schema.fields[field] = {
			type: type,
			editable: colEditable, 
			nullable: nullable,
			validation: validation, // todo: check if this gives errors on undefined/null				
		}
		
		this.kOptions.columns.push({
			field: field,
			title: title,
		})
	}
}

export interface IGridConfig {
	searchable?: boolean,
	editable?: boolean,
	onSelect?: (selectedRow?) => any,
	headerButtons?: [{
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