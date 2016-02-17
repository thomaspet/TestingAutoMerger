export class UniTableColumn {
    field: string = "";
    title: string = "";
    type: string  = "";
    format: string = "";
    editable: boolean = true;
    nullable: boolean = false;
    // todo: validation
    
    constructor(field: string, title: string, type: string) {
        this.field = field;
        this.title = title;
        this.type = type;
    }
    
    setFormat(format: string) {
        this.format = format;
        return this;
    }
    
    setEditable(editable: boolean) {
        this.editable = editable;
        return this;
    }
    
    setNullable(nullable: boolean) {
        this.nullable = nullable;
        return this;
    }
    
}