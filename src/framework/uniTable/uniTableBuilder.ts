import {UniHttpService, UniHttpRequest} from '../data/uniHttpService';
import {UniTableColumn} from './uniTableColumn';

export class UniTableBuilder {
    remoteData: boolean;
    resource: string | Array<any>;
    
    filter: string = "";
    expand: string = "";
    searchable: boolean = true;
    editable: boolean;
    filterable: boolean;
    pageable: boolean | Object;
    pageSize: number;
    
    toolbar: string[];
    
    selectCallback: (selectedItem) => any;
    updateCallback: (updatedItem) => any;
    createCallback: (createdItem) => any;
    deleteCallback: (deletedItem) => any;
    
    schemaModel: any;
    columns: kendo.ui.GridColumn[];
    
    
    constructor(resource: string | Array<any>, editable: boolean = true) {
        this.resource = resource;
        this.editable = editable;
        this.filterable = true;
        this.pageable = {input: true, numeric: false};
        this.pageSize = 10;
        this.remoteData = !(Array.isArray(resource));
        
        if (editable) {
            this.toolbar = ['create', 'save', 'cancel'];   
        }
        
        this.schemaModel = {
            id: 'ID',
            fields: {}
        };
        
        this.columns = [];        
    }
    
    addColumns(...columns: UniTableColumn[]) {        
        columns.forEach((column: UniTableColumn) => {
            
            this.columns.push({
                field: column.field,
                title: column.title,
                format: column.format,
                // Add css class 'editable-cell' if column is editable 
                attributes: { "class": (column.editable) ? 'editable-cell' : '' }
            });
            
            this.schemaModel.fields[column.field] = {
                type: column.type,
                editable: column.editable,
                nullable: column.nullable
            };
            
        });
        
        // Add delete button if table is editable
        if (this.editable) {
            this.columns.push({
                command: ['destroy'],
                title: ' '
            });
        }
        
        return this;
    }
    
    setFilter(filter: string) {
        this.filter = filter;
        return this;
    }
    
    setExpand(expand: string) {
        this.expand = expand;
        return this;
    }
    
    setUpdateCallback(callbackFunction: (updatedItem) => any) {
        this.updateCallback = callbackFunction;
        return this;
    }
    
    setCreateCallback(callbackFunction: (createdItem) => any) {
        this.createCallback = callbackFunction;
        return this;
    }
    
    setDeleteCallback(callbackFunction: (deletedItem) => any) {
        this.deleteCallback = callbackFunction;
        return this;
    }
    
    setSelectCallback(callbackFunction: (selectedItem) => any) {        
        this.selectCallback = callbackFunction;
        return this;
    }
    
    setFilterable(filterable: boolean) {
        this.filterable = filterable;
        return this;
    }
    
    setPageable(pageable: boolean) {
        if (pageable) {
            this.pageable = {input: true, numeric: false};
        } else {
            this.pageable = false;
        }
        
        return this;
    }
    
    setPageSize(pageSize: number) {
        this.pageSize = pageSize;
        return this;
    }
    
    setToolbarOptions(options: string[]) {
        this.toolbar = options;
        return this;
    }
    
}