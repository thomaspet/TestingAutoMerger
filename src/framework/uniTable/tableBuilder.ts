import {UniTableConfig, UniTableColumn, UniTableColumnType} from 'unitable-ng2/main';

export class TableBuilder extends UniTableConfig {
    
    constructor(editable?: boolean, pageable?: boolean, pageSize?: number) {
        super(editable, pageable, pageSize);
        console.log(this);
    }    
    
    // Map layout system's FieldType to UniTableColumnType
    private mapFieldType(layoutFieldType): UniTableColumnType {
        var colType = UniTableColumnType.Text;
        
        switch (layoutFieldType) {
            case 0:
                colType = UniTableColumnType.Lookup;
                break;
            case 2:
                colType = UniTableColumnType.Date;
                break;
            case 6:
                colType = UniTableColumnType.Number;
                break;
        }
        
        return colType;
    }
    
    public setColumnsFromLayout(jsonLayout) {        
        let layoutColumns = JSON.parse(jsonLayout);
        
        layoutColumns.forEach((col) => {
            let newCol = new UniTableColumn(col.Property, col.Label, this.mapFieldType(col.FieldType)); // todo: map type?
            
            newCol.displayField = col.DisplayField || undefined;
            
            if (col.Options) {
                newCol.cls = col.Options.Cls || '';
                newCol.headerCls = col.Options.HeaderCls || '';
                newCol.format = col.Options.Format || undefined;
                newCol.width = col.Options.Width || undefined;
                newCol.filterOperator = col.Options.FilterOperator || 'contains';
                
                
                if (col.Options.Editable === false) {
                    newCol.editable = false;
                }
                
                if (col.Options.Visible === false) {
                    newCol.visible = false;
                }    
            }
            
            this.columns.push(newCol);
        });
        
        return this;
    }
    
    /**
     * Simplifies setting column properties that do not come from the layout system.
     * E.g. custom editor, conditionalCls function, template function
     * 
     * @param {string} columnField  Field of the column you want to add property to
     * @param {Object} properties   Properties to add. Key here will be key in column object
     * 
     */
    public setColumnProperties(columnField: string, properties: Object) {
        this.columns.forEach((col) => {
            if (col.field === columnField) {
                Object.keys(properties).forEach((key) => {
                    col[key] = properties[key];
                });                
            }
        });
        
        return this;
    }
}
