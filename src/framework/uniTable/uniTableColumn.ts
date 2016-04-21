import {UniTableControls} from './uniTableControls';

export class UniTableColumn {
    private controls: UniTableControls = new UniTableControls();
    
    public field: string = '';
    public title: string = '';
    public type: string  = '';
    public format: string = '';
    public editable: boolean = true;
    public nullable: boolean = false;
    public class: string = '';
    public template: string | Function = '';
    public command: kendo.ui.GridColumnCommandItem[] = [];
    public width: string = '';
    public editor: any;
    public defaultValue: any;
    public values: any[];
    public textAlign: string = 'left';
    public hidden: boolean = false;
    public showOnSmallScreen: boolean = true;
    public showOnLargeScreen: boolean = true;
    
    constructor(field: string, title: string, type: string = '') {
        this.title = title;
        this.type = type;
        
        if (type === 'number' && field !== 'ID') {
            this.textAlign = 'right';
        }
        
        // Set custom editor and default format on date columns
        if (type === 'date') {
            this.editor = this.controls.datepicker({});
            this.format = '{0: dd.MM.yyyy}';
            this.textAlign = 'right';
        }        
        
        // Separate multi-level expanded fields with $
        // so we can flatten/unflatten the dataobjects to avoid kendo crash.
        let splitField = field.split('.');
        if (splitField.length > 1) {
            this.field = splitField.join('$');
        } else {
            this.field = field;
        }
    }
    
    public setFormat(format: string) {
        this.format = format;
        return this;
    }
    
    public setEditable(editable: boolean) {
        this.editable = editable;
        return this;
    }
    
    public setNullable(nullable: boolean) {
        this.nullable = nullable;
        return this;
    }
    
    public setClass(classString: string) {
        this.class = classString;
        return this;
    }
    
    public setTemplate(template: string | Function) {
        this.template = template;
        return this;
    }
   
    public setCommand(command: kendo.ui.GridColumnCommandItem[]) {
        this.command = command;
        return this;
    }
    
    public setWidth(width: string) {
        this.width = width;
        return this;
    }
    
    public setHidden(hidden: boolean = true) {
        this.hidden = hidden;
        return this;
    }
    
    public setShowOnSmallScreen(show: boolean) {
        this.showOnSmallScreen = show;
        return this;
    }
    
    public setShowOnLargeScreen(show: boolean) {
        this.showOnLargeScreen = show;
        return this;
    }
    
    public setDefaultValue(defaultValue) {
        this.defaultValue = defaultValue;
        return this;
    }
    
    public setValues(values: any[]) {
        this.values = values;
        return this;
    }

    public setCustomEditor(type: string,
                           kendoOptions: any,
                           changeCallback?: (item: any, rowModel: any) => any) {
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
            
            case 'readonlyeditor':
                this.editor = this.controls.readonlyeditor(kendoOptions);
            break;
        }
        
        return this;
    }
    
    public overrideTextAlign(textAlign: string) {
        this.textAlign = textAlign;
        return this;
    }
}
