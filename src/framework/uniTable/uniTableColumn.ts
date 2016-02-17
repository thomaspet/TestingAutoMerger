export class UniTableColumn {
    field: string = "";
    title: string = "";
    type: string  = "";
    format: string = "";
    editable: boolean = true;
    nullable: boolean = false;
    template: string = "";
    command: kendo.ui.GridColumnCommandItem[] = [];
    classes = [];
    width: string = "";
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
    
    setTemplate(template: string) {
        this.template = template;
        return this;
    }
   
    setCommand(command: kendo.ui.GridColumnCommandItem[]) {
        this.command = command;
        return this;
    }
    
    setWidth(width: string) {
        this.width = width;
        return this;
    }
    
    addClass(cls: string) {
        this.classes.push(cls);
        return this;
    }
       
}