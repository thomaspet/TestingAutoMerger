import {UniTableControls} from './uniTableControls';

export class UniTableColumn {
    private controls = new UniTableControls();
    
    field: string = "";
    title: string = "";
    type: string  = "";
    format: string = "";
    editable: boolean = true;
    nullable: boolean = false;
    class: string = "";
    template: string | Function = "";
    command: kendo.ui.GridColumnCommandItem[] = [];
    width: string = "";
    
    editor: any;
    customEditor: { type: string, kendoOptions: any };
    // todo: validation
    
    constructor(field: string, title: string, type: string = '') {
        this.field = field;
        this.title = title;
        this.type = type;
        
        // Set custom editor and default format on date columns
        if (type === 'date') {
            this.editor = this.controls.datepicker({});
            this.format = "{0: dd.MM.yyyy}";
        }
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
    
    setClass(classString: string) {
        this.class = classString;
        return this;
    }
    
    setTemplate(template: string | Function) {
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

    setCustomEditor(type: string, kendoOptions: any, changeCallback?: (item: any, rowModel: any) => any) {
        switch (type) {
            case 'dropdown':
                this.editor = this.controls.dropdown(kendoOptions, changeCallback);
            break;
            
            case 'combobox':
                this.editor = this.controls.combobox(kendoOptions, changeCallback);
            break;
            
            case 'datepicker':
                this.editor = this.controls.datepicker(kendoOptions);
            break;
            
        }
        
        return this;
    } 
}