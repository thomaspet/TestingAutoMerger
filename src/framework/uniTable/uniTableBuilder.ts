import {UniTableColumn} from './uniTableColumn';

declare var jQuery;

export class UniTableBuilder {
    
    public remoteData: boolean;
    
    public resource: string | Array<any>;
    public filter: string = '';
    public expand: string = '';
    public orderBy: kendo.data.DataSourceSortItem;
    
    public searchable: boolean = true;
    public filterable: boolean = true;
    public editable:   boolean = true;
    public pageable:   boolean = true;
    public pageSize:   number  = 10;
    
    public toolbar: string[] = [];
    
    public selectCallback: (selectedItem) => any;
    public updateCallback: (updatedItem) => any;
    public createCallback: (createdItem) => any;
    public deleteCallback: (deletedItem) => any;
    
    public schemaModel: any;
    public columns: kendo.ui.GridColumn[];
    public commands: kendo.ui.GridColumnCommandItem[] = [];
    
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
    
    public addColumns(...columns: UniTableColumn[]) {
        columns.forEach((columnInfo: UniTableColumn) => {
            
            // Add class editable-cell to columns that are editable
            if (columnInfo.editable) {
                columnInfo.class += ' editable-cell';
            }
                      
            this.columns.push({
                field: columnInfo.field,
                title: columnInfo.title,
                format: columnInfo.format,
                width: columnInfo.width,
                template: columnInfo.template || null,
                editor: columnInfo.editor || null,
                values: columnInfo.values || null,
                attributes: {
                    class: columnInfo.class,
                    style: 'text-align: ' + columnInfo.textAlign
                },
                headerAttributes: {
                    style: 'text-align: ' + columnInfo.textAlign
                }
            });
                      
            this.schemaModel.fields[columnInfo.field] = {
                type: columnInfo.type,
                editable: columnInfo.editable,
                nullable: columnInfo.nullable,
                defaultValue: columnInfo.defaultValue || null,
            };            
        });
        
        // Make sure ID field is always defined in the schema
        if (!this.schemaModel.fields['ID']) {
            this.schemaModel.fields['ID'] = { type: 'number', editable: false, nullable: true };
        }
                
        return this;
    }
    
    public addCommands(...commands: kendo.ui.GridColumnCommandItem[]) {
        this.commands = commands;
        return this;
    }
    
    public setEditable(editable: boolean) {
        this.editable = editable;
        return this;
    }
    
    public setSearchable(searchable: boolean) {
        this.searchable = searchable;
        return this;
    }
    
    public setFilter(filter: string) {
        this.filter = filter;
        return this;
    }
    
    public setOrderBy(field: string, direction?: string) {
        this.orderBy = {
            field: field,
            dir: direction || ''
        };
        
        return this;
    }
    
    public setExpand(expand: string) {
        this.expand = expand;
        return this;
    }
    
    public setUpdateCallback(callbackFunction: (updatedItem) => any) {
        this.updateCallback = callbackFunction;
        return this;
    }
    
    public setCreateCallback(callbackFunction: (createdItem) => any) {
        this.createCallback = callbackFunction;
        return this;
    }
    
    public setDeleteCallback(callbackFunction: (deletedItem) => any) {
        this.deleteCallback = callbackFunction;
        return this;
    }
    
    public setSelectCallback(callbackFunction: (selectedItem) => any) {        
        this.selectCallback = callbackFunction;
        return this;
    }
    
    public setFilterable(filterable: boolean) {
        this.filterable = filterable;
        return this;
    }
    
    public setPageable(pageable: boolean) {
        this.pageable = pageable;        
        return this;
    }
    
    public setPageSize(pageSize: number) {
        this.pageSize = pageSize;
        return this;
    }
    
    public setToolbarOptions(options: string[]) {
        this.toolbar = options;
        return this;
    }
    
}