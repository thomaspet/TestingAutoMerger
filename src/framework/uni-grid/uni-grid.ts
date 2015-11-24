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
export class UniGrid {	
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