export class UniTableConfig {
	queryData = {
        url: '',
        expand: '',
        select: '',
        filter: ''
    };
    
	searchable: boolean;
    editable: boolean;
	onSelect: (selectedRow?: any) => any;
	
	fields: any;
	columns: any[];
	
	constructor(resourceUrl: string, searchable: boolean = true, editable: boolean = false) {
		this.queryData.url = resourceUrl;
		this.searchable = searchable;
        this.editable = editable;
		this.fields = {};
		this.columns = [];
	}
	
	setResourceUrl(resourceUrl: string) {
		this.queryData.url = resourceUrl;
		return this;
	}
    
    setSelectString(selectString: string) {
        this.queryData.select = selectString;
        return this;
    }
    
    setExpandString(expandString: string) {
        this.queryData.expand = expandString;
        return this;
    }
    
    setFilterString(filterString: string) {
        this.queryData.filter = filterString;
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
    
    setSchema(schema: any) {
        this.fields = schema;
        return this;
    }
    
    setColumns(columns: any) {
        this.columns = columns;
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