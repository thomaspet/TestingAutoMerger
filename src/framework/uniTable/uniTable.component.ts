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
} from 'angular2/angular2';

export interface ITableConfig {
	searchable?: boolean,
	editable?: boolean,
	onSelect?: (selectedRow?) => any,
	tableButtons?: [{
		title: string,
		classes?: string,
		iconClasses?: string,
		onClick: Function
	}],
	kOptions: kendo.ui.GridOptions
}

@Component({
	selector: 'uni-table',
	templateUrl: 'framework/uniTable/uniTable.component.html',
	directives: [NgIf, NgFor, NgClass]
})
export class UniTableComponent implements AfterViewInit {	
	@Input() config: ITableConfig;
	
	filterString: string = "";
	tableID: string;
	table: kendo.ui.Grid;
	
	constructor() { 
		// Generate unique ID for the table
		this.tableID = "uni-table-" + Date.now();
	}
	
	ngAfterViewInit() {
		var vm = this;
		
		if (vm.config.onSelect) {
			vm.config.kOptions.selectable = "row";
			
			// change event is fired when the user clicks a row in the table
			vm.config.kOptions.change = function(event: kendo.ui.GridChangeEvent) {
				var item = event.sender.dataItem(this.select());
				vm.config.onSelect(item);
			}
		}
		
		var element: any = $('#' + this.tableID);
		element.kendoGrid(vm.config.kOptions);
		
		this.table = element.data('kendoGrid');
	}
	
	filterTable() {
		var val = this.filterString;
		var filter = { logic: 'or', filters: [] };
		
		var fields = this.config.kOptions.dataSource.schema.model.fields;
		
		for (var fieldName of Object.keys(fields)) {
			let field = fields[fieldName];
			
			if (field.type === 'number') {
				var numericFilter = this.getNumericFilter(fieldName, val);
				if (numericFilter) filter.filters.push(numericFilter);
			}
			else if (field.type === 'date') {
				// todo? Not sure if there is any point in allowing date filtering through the textbox? (the column has its own filter functionality)
			}
			else {
				filter.filters.push({
					field: fieldName,
					operator: 'contains',
					value: val
				});
			}
		}
		this.table.dataSource.query({filter: filter});
	}
	
	private getNumericFilter(fieldName, userInput) {
		if (isNaN(userInput)) return null;
		
		return {
			field: fieldName,
			operator: 'eq',
			value: parseInt(userInput)
		}
	}
	
}