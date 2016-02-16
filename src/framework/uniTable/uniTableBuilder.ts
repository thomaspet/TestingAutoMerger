import {UniHttpService, UniHttpRequest} from '../data/uniHttpService';
import {UniTableColumn} from './uniTableColumn';

declare var jQuery;

export class UniTableBuilder {
    remoteData: boolean;
    
    resource: string | Array<any>;
    filter: string = "";
    expand: string = "";
    
    searchable: boolean = true;
    filterable: boolean = true;
    editable:   boolean = true;
    pageable:   boolean = true;
    pageSize:   number  = 10;
    
    toolbar: string[] = [];
    
    selectCallback: (selectedItem) => any;
    updateCallback: (updatedItem) => any;
    createCallback: (createdItem) => any;
    deleteCallback: (deletedItem) => any;
    
    schemaModel: any;
    columns: kendo.ui.GridColumn[];
    
    constructor(resource: string | Array<any>, editable: boolean = true) {
        this.resource = resource;
        this.editable = editable;
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
                attributes: { "class": (column.editable) ? 'editable-cell' : '' } // add class 'editable-cell' if column is editable
            });
            
            // var schemaFieldKeys: string[] = column.field.split('.');
            // jQuery.extend(true, this.schemaModel.fields, this.generateSchemaField(schemaFieldKeys, column.type, column.editable, column.nullable));
        });
        
        // Make sure ID field is always defined in the schema (required for crud operations on the table)
        if (!this.schemaModel.fields['ID']) {
            this.schemaModel.fields['ID'] = { type: 'number', editable: false, nullable: true };
        }
        
        console.log(this.schemaModel);
        
        // Add delete button if table is editable
        if (this.editable) {
            this.columns.push({
                command: ['destroy'],
                title: ' '
            });
        }
        
        return this;
    }
    
    // Recursively generates a kendo schema field from the field info given in addColumns
    private generateSchemaField(keys: string[], type: string, editable: boolean, nullable: boolean): Object {
        
        if (keys.length === 0) {
            return {
                type: type,
                editable: editable,
                nullable: nullable
            }
        }
        
        var field = {};
        field[keys[0]] = this.generateSchemaField(keys.slice(1), type, editable, nullable);
        return field;
    }    
    
    setEditable(editable: boolean) {
        this.editable = editable;
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
        this.pageable = pageable;        
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