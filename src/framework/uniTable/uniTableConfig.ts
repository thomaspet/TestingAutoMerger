interface IOdata {
    expand?: string,
    filter?: string
}

export class UniTableConfig {    
    resourceUrl: string;
    odata: IOdata;

	searchable: boolean;
    editable: boolean;
	
    dsModel: kendo.data.DataSourceSchemaModel;
	columns: kendo.ui.GridColumn[];
	
    // Only available in read-only grids.
    // Example: invoice list with onSelect => gotoInvoiceDetails(invoice)
	onSelect: (selectedRow?: any) => any;
    
	constructor(resourceUrl: string, searchable: boolean = true, editable: boolean = false) {
		this.resourceUrl = resourceUrl;
        this.odata = {}
		this.searchable = searchable;
        this.editable = editable;
		this.dsModel = {};
		this.columns = [];
	}
	
    setResourceUrl(url: string) {
        this.resourceUrl = url;
        return this;
    }
    
    setOdata(odata: IOdata) {
        this.odata = odata;
        return this;
    }
    
    setColumns(columns: Array<kendo.ui.GridColumn>) {
        this.columns = columns;
        return this;
    }
    
    setDsModel(model: kendo.data.DataSourceSchemaModel) {
        this.dsModel = model;
        return this;
    }
	
	setSearchable(searchable: boolean) {
		this.searchable = searchable;
		return this;
	}
    
    setEditable(editable: boolean) {
        this.editable = editable;
        return this;
    }
	
	setOnSelect(onSelect: (selectedRow?: any) => any) {
		this.onSelect = onSelect;
		return this;
	}
    
}