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

export interface ITableConfig {
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
	selector: 'uni-table',
	templateUrl: 'framework/uni-table/uniTable.component.html',
	directives: [NgIf, NgFor, NgClass]
})
export class UniTableComponent {	
	@Input() config: ITableConfig;
	
	filterString: string = "";
	tableID: string;
	table: kendo.ui.Grid;
	
	constructor() { 
		// Generate unique ID for the table
		this.tableID = "uni-table-" + Date.now();
	}
	
	afterViewInit() {
		var config = this.config;
		
		if (config.onSelect) {
			config.kOptions.selectable = "row";
			
			// change event is fired when the user clicks a row in the table
			config.kOptions.change = function(event: kendo.ui.GridChangeEvent) {
				var item = event.sender.dataItem(this.select());
				config.onSelect(item);
			}
		}
		
		var element: any = $('#' + this.tableID);
		element.kendoGrid(config.kOptions);
		
		this.table = element.data('kendoGrid');
	}
	
	filterTable() {
		var val = this.filterString;
		
		var filter = { logic: 'or', filters: [] };
		this.table.columns.forEach(function(column) {
			if (column.filterable) {
				filter.filters.push({
					field: column.field,
					operator: 'contains',
					value: val
				})
			}
		});
		
		this.table.dataSource.query({filter: filter});
	}
} 