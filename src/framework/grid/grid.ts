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

export interface GridConfig {
	id: string,
	searchable?: boolean,
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
	templateUrl: 'framework/grid/grid.html',
	directives: [NgIf, NgFor, NgClass]
})
export class UniGrid {
	gridID: string;
	
	@Input() config;
	filterString: string = "";
	grid: kendo.ui.Grid;
	
	constructor() { 
		// Generate unique ID for the grid
		this.gridID = "uni-grid-" + Date.now();
	}
	
	afterViewInit() {
		var element: any = $('#' + this.gridID);
		element.kendoGrid(this.config.kOptions);
		
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