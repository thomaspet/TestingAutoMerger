export class UniTableConfig {
	lookupUrl: string;
	searchable: boolean;
	onSelect: (selectedRow?: any) => any;
	
	// todo: can we type these?
	fields: any;
	columns: any[];
	
	constructor(lookupUrl: string, searchable: boolean) {
		this.lookupUrl = lookupUrl;
		this.searchable = searchable;
		this.fields = {};
		this.columns = [];
	}
	
	setLookupUrl(lookupUrl: string) {
		this.lookupUrl = lookupUrl;
		return this;
	}
	
	setSearchable(searchable: boolean) {
		this.searchable = searchable;
		return this;
	}
	
	setOnSelect(onSelect: (selectedRow?: any) => any) {
		this.onSelect = onSelect;
		return this;
	}
	
	addColumn(field: string, title: string, type: string, format?: string, filterable: boolean = true) {
		// Define a default date format to use if not specified on a date column
		var columnFormat = format;
		if (type === 'date' && !columnFormat) {
			columnFormat = '{0: dd.MM.yyyy}';
		}
		
		// Fields are used in the kendo datasource schema
		this.fields[field] = {
			type: type,
			filterable: filterable
		};
		
		// Columns define what is shown in the kendo grid
		this.columns.push({
			field: field,
			title: title,
			format: columnFormat
		});
		return this;
	}	
}