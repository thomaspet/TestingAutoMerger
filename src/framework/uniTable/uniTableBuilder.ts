import {UniHttpService, IUniHttpRequest} from '../data/uniHttpService';
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
    commands: kendo.ui.GridColumnCommandItem[] = [];
    
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
        
        columns.forEach((columnInfo: UniTableColumn) => {
            
            // Add class editable-cell to columns that are editable
            if (columnInfo.editable) {
                columnInfo.class += ' editable-cell';
            }
            
            var column = {
                field: columnInfo.field,
                title: columnInfo.title,
                format: columnInfo.format,
                template: columnInfo.template || null,
                attributes: {
                    "class": columnInfo.class
                }
            };      
            
            this.schemaModel.fields[columnInfo.field] = {
                type: columnInfo.type,
                editable: columnInfo.editable,
                nullable: columnInfo.nullable,
            }
            
            // var schemaField = columnInfo.field.split('.');
            // var fieldName = schemaField.join('');
            // 
            // this.schemaModel.fields[fieldName] = {
            //     type: columnInfo.type,
            //     editable: columnInfo.editable,
            //     nullable: columnInfo.nullable,
            // }
            // 
            // if (schemaField.length > 1) {
            //     this.schemaModel.fields[fieldName].from = columnInfo.field;
            //     column.field = fieldName;
            // }
            
            this.columns.push(column);

        });
        
        // Make sure ID field is always defined in the schema (required for crud operations on the table)
        if (!this.schemaModel.fields['ID']) {
            this.schemaModel.fields['ID'] = { type: 'number', editable: false, nullable: true };
        }
        
        console.log(this.columns);
        console.log(this.schemaModel);
        
        return this;
    }
    
    addCommands(...commands: kendo.ui.GridColumnCommandItem[]) {
        this.commands = commands;
        return this;
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