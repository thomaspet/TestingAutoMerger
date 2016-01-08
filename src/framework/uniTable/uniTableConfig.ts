export interface IOdata {
    expand?: string,
    select?: string,
    filter?: string
}

export interface IColumn {
    field: string,
    title: string,
	format?: string
}

export class UniTableConfig {    
    resourceUrl: string;
    odata: IOdata;

	searchable: boolean;
    editable: boolean;
	onSelect: (selectedRow?: any) => any;
	
    dsModel: kendo.data.DataSourceSchemaModel;
	columns: IColumn[];
	
	constructor(resourceUrl: string, searchable: boolean = true, editable: boolean = false) {
		this.resourceUrl = resourceUrl;
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
    
    setColumns(columns: IColumn[]) {
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