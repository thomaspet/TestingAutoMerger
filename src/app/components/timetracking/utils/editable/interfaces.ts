export interface IChangeEvent {
    value:any;
    col: number;
    row: number;
    cancel: boolean;
    updateCell: boolean;
    columnDefiniton?: ICol;
    lookupValue?:any;
}

export interface ICol {
    name: string;
    label?: string;
    typeName?: string;
    width?: number;
    visible?: boolean;
    alignment?: string;
    route?: string;
}

export interface IPos {
    col: number;
    row: number;
}

export interface IJQItem {
    on(eventName:string, fx:Function);
    off(eventName:string, fx:Function);
    is(tagName:string):boolean;
    text(value?:string):string;
    css(style:any, value?:any);
    val(value?:string):string;
    show();
    hide();
    attr(name:string, value?:any);
    focus();
    outerHeight(value?:number):number;
    outerWidth(value?:number):number;
    offset(ref?:any):any;
    select();
    parent():IJQItem;
    index():number;
    append(content:any);
    find(filter?:any):IJQItem;
    first(filter?:any):IJQItem;
    last(filter?:any):IJQItem;
    next(filter?:any):IJQItem;
    prev(filter?:any):IJQItem;
    parent(filter?:any):IJQItem;
    children(filter?:any):IJQItem;
    length:number;
    eq(filter:any):IJQItem;
}

export interface IEditEvents {
    onEditChanged(value:any, position:IPos):boolean;
    onEditKeydown(event:any);
}

export interface IRect {
    left:number;
    top:number;
    width:number;
    height:number;
}

export interface IEditor {
    editEvents:IEditEvents;
    create(owner:IJQItem): IJQItem;
    destroy();
    move(pos:IRect);
    moveTo(cell:IJQItem);
    focus();
    close(cancel:boolean);
    startEdit(value:any, cell:IJQItem, pos: IPos);
    setValue(value:any);
    finalizeEdit(cancel:boolean):boolean;
}

export var Keys = {
    ARROW_LEFT : 37, ARROW_UP : 38, ARROW_RIGHT : 39, ARROW_DOWN : 40,
    ENTER : 13, ESC : 27, TAB : 9, F2 : 113, F3 : 114, F4 : 115, SPACE : 32,
    CTRL : 17, SHIFT : 16,
    HOME : 36, END : 35, INSERT : 45, DELETE : 46, PAGEUP : 33, PAGEDOWN : 34
};

export class Column implements ICol {
    label:string;
    visible = true;
    typeName:string;
    route:string;
    constructor(public name:string, label = '', typeName = 'text', route?:string) {
        this.label = label || name;
        this.typeName = typeName; 
        this.route = route;
    }
}